import { NextResponse } from "next/server";
import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
} from "openai";
import { PARENTING_STYLES, type ParentingStyleCode, type ParentingStyleInfo } from "@/data/questions";
import { getOpenAIClient } from "@/lib/openai";
import { InvalidAnswersError, scoreAnswers } from "@/lib/scoreAnswers";

// Route Handlers run server-side only, so OPENAI_API_KEY (read inside
// getOpenAIClient) never reaches the client bundle.

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const MAX_RESULT_CHARS = 300;

interface AnalyzeSuccessResponse {
  status: "success";
  data: {
    resultType: ParentingStyleCode;
    styleName: string;
    scores: Record<ParentingStyleCode, number>;
    result: string;
  };
}

interface AnalyzeErrorResponse {
  status: "error";
  message: string;
}

// 呼叫端可依以下三種狀態處理 UI：
// - 等待中：fetch 尚未 resolve（這支 API 是同步處理，最長等待 OPENAI_API_KEY
//   請求逾時的 30 秒，見 lib/openai.ts 的 timeout 設定）
// - 成功：HTTP 200，status === "success"
// - 失敗：HTTP 4xx/5xx，status === "error"，message 為可讀的失敗原因
export async function POST(
  request: Request
): Promise<NextResponse<AnalyzeSuccessResponse | AnalyzeErrorResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "請提供有效的 JSON 格式請求內容。" },
      { status: 400 }
    );
  }

  const answers = (body as { answers?: unknown } | null)?.answers;

  let scoring;
  try {
    scoring = scoreAnswers(answers);
  } catch (err) {
    const message =
      err instanceof InvalidAnswersError ? err.message : "答案格式不正確，請確認後再試一次。";
    return NextResponse.json({ status: "error", message }, { status: 400 });
  }

  const { scores, resultType } = scoring;
  const style = PARENTING_STYLES[resultType];

  try {
    const result = await generateAnalysis({ scores, style });
    return NextResponse.json({
      status: "success",
      data: { resultType, styleName: style.name, scores, result },
    });
  } catch (err) {
    const message = toReadableErrorMessage(err);
    const status = toHttpStatus(err);
    return NextResponse.json({ status: "error", message }, { status });
  }
}

async function generateAnalysis({
  scores,
  style,
}: {
  scores: Record<ParentingStyleCode, number>;
  style: ParentingStyleInfo;
}): Promise<string> {
  const client = getOpenAIClient();

  const scoreBreakdown = (Object.entries(scores) as [ParentingStyleCode, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([code, score]) => `${PARENTING_STYLES[code].name}：${score} 分`)
    .join("、");

  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.7,
    max_tokens: 600,
    messages: [
      {
        role: "system",
        content:
          "你是親職教育顧問，會根據使用者在育兒風格測驗中的作答傾向撰寫繁體中文分析。" +
          "內容需包含：對此人育兒風格傾向的分析、一句綜合評價，以及具體、可執行的客觀建議。" +
          "語氣中立、客觀、不批判、不說教，不要使用「你很糟糕」之類的否定字眼。" +
          `全文（含標點）不得超過 ${MAX_RESULT_CHARS} 字，直接輸出分析內容本身，不要加標題、前綴或 markdown 符號。`,
      },
      {
        role: "user",
        content:
          `測驗結果：使用者各風格得分為 ${scoreBreakdown}，主要風格判定為「${style.name}」（${style.englishName}）。\n` +
          `此風格的核心行為模式：${style.coreBehavior}\n` +
          `優點／正面效益：${style.benefits}\n` +
          `潛在風險／缺點：${style.risks}\n` +
          `建議實踐方式：${style.suggestion}\n` +
          "請根據以上資料，為這位使用者生成個人化分析。",
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI 未回傳任何分析內容，請稍後再試一次。");
  }

  // 字數上限是硬性規格，不能只靠 prompt 約束模型行為，這裡做保險截斷。
  return text.length > MAX_RESULT_CHARS ? `${text.slice(0, MAX_RESULT_CHARS - 1)}…` : text;
}

function toReadableErrorMessage(err: unknown): string {
  if (err instanceof AuthenticationError || err instanceof PermissionDeniedError) {
    return "OpenAI API 金鑰無效或未授權，請確認伺服器的 OPENAI_API_KEY 設定是否正確。";
  }
  if (err instanceof RateLimitError) {
    return "已達 OpenAI API 使用限制或額度不足，請稍後再試。";
  }
  // 必須放在 APIConnectionError 之前判斷，因為它是該類別的子類別。
  if (err instanceof APIConnectionTimeoutError) {
    return "呼叫 OpenAI 服務逾時，請稍後再試。";
  }
  if (err instanceof APIConnectionError) {
    return "無法連線到 OpenAI 服務，請檢查伺服器的網路連線。";
  }
  if (err instanceof APIError) {
    return `呼叫 OpenAI 服務失敗（狀態碼 ${err.status ?? "未知"}）：${err.message}`;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "呼叫 OpenAI 服務時發生未知錯誤。";
}

function toHttpStatus(err: unknown): number {
  // 伺服器端設定問題（金鑰無效／無權限），對呼叫端而言是我們的錯，回 500。
  if (err instanceof AuthenticationError || err instanceof PermissionDeniedError) {
    return 500;
  }
  if (err instanceof RateLimitError) {
    return 429;
  }
  if (err instanceof APIConnectionTimeoutError) {
    return 504;
  }
  if (err instanceof APIConnectionError) {
    return 502;
  }
  if (err instanceof APIError) {
    return 502;
  }
  return 500;
}
