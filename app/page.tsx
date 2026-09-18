"use client";

import { useState, type FormEvent } from "react";
import {
  PARENTING_STYLES,
  QUESTIONS,
  QUIZ_TITLE,
  type ParentingStyleCode,
  type QuizQuestion,
} from "@/data/questions";

type Step = "intro" | "quiz" | "email" | "loading" | "result" | "error";

interface AnalysisSections {
  analysis: string;
  evaluation: string;
  // 建議是卡片式排版，所以是多條短項目的陣列，不是一整段長文字。
  suggestions: string[];
  activity: string;
}

interface AnalyzeResultData {
  resultType: ParentingStyleCode;
  styleName: string;
  scores: Record<ParentingStyleCode, number>;
  result: string;
  sections: AnalysisSections;
}

interface ApiSuccessBody<T> {
  status: "success";
  data: T;
}

interface ApiErrorBody {
  status: "error";
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Home() {
  const [step, setStep] = useState<Step>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resultData, setResultData] = useState<AnalyzeResultData | null>(null);

  function handleStart() {
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedOptionId(null);
    setStep("quiz");
  }

  function handleNextQuestion() {
    if (!selectedOptionId) return;

    const nextAnswers = [...answers, selectedOptionId];
    setAnswers(nextAnswers);
    setSelectedOptionId(null);

    if (questionIndex + 1 < QUESTIONS.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setStep("email");
    }
  }

  // 唯一會把 step 設成 "result" 的地方：跑完全部題目、填了合法 email，
  // 且 /api/analyze 與 /api/leads 都成功回傳之後。沒有其他路徑能看到結果畫面。
  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage("請輸入正確的 email 格式。");
      return;
    }

    setErrorMessage("");
    setStep("loading");

    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const analyzeJson = (await analyzeRes.json()) as
        | ApiSuccessBody<AnalyzeResultData>
        | ApiErrorBody;

      if (!analyzeRes.ok || analyzeJson.status !== "success") {
        throw new Error(
          analyzeJson.status === "error" ? analyzeJson.message : "分析失敗，請稍後再試。"
        );
      }

      const analysis = analyzeJson.data;

      const leadsRes = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          answers,
          result: analysis.result,
          resultType: analysis.resultType,
        }),
      });
      const leadsJson = (await leadsRes.json()) as ApiSuccessBody<unknown> | ApiErrorBody;

      if (!leadsRes.ok || leadsJson.status !== "success") {
        throw new Error(
          leadsJson.status === "error" ? leadsJson.message : "儲存資料失敗，請稍後再試。"
        );
      }

      setResultData(analysis);
      setStep("result");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "發生未知錯誤，請稍後再試，或聯絡網站管理員。"
      );
      setStep("error");
    }
  }

  function handleRetry() {
    setErrorMessage("");
    setStep("email");
  }

  function handleRestart() {
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedOptionId(null);
    setEmail("");
    setErrorMessage("");
    setResultData(null);
    setStep("intro");
  }

  // 首頁（intro）是行銷向的 landing page，結果頁是雙欄 dashboard，
  // 兩者內容都比較多、需要從上往下捲動閱讀，所以用比較寬的版面、
  // 也不做垂直置中；其餘步驟維持原本窄版、置中的「app」版面。
  const isWide = step === "intro" || step === "result";

  return (
    <div className="min-h-dvh bg-(--background)">
      <main
        className={
          isWide
            ? "mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16"
            : "mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-16"
        }
      >
        <div key={step} className="animate-fade-in-up">
          {step === "intro" && <LandingScreen onStart={handleStart} />}

          {step === "quiz" && (
            <QuizScreen
              question={QUESTIONS[questionIndex]}
              questionIndex={questionIndex}
              totalQuestions={QUESTIONS.length}
              selectedOptionId={selectedOptionId}
              onSelectOption={setSelectedOptionId}
              onNext={handleNextQuestion}
            />
          )}

          {step === "email" && (
            <EmailScreen
              email={email}
              onEmailChange={setEmail}
              onSubmit={handleSubmit}
              errorMessage={errorMessage}
            />
          )}

          {step === "loading" && <LoadingScreen />}

          {step === "result" && resultData && (
            <ResultScreen data={resultData} onRestart={handleRestart} />
          )}

          {step === "error" && (
            <ErrorScreen message={errorMessage} onRetry={handleRetry} onRestart={handleRestart} />
          )}
        </div>
      </main>
    </div>
  );
}

// ---------- 共用元件 ----------

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      {children}
    </div>
  );
}

function SectionBlock({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-stone-500">
        {icon}
        <h3 className="text-sm font-semibold tracking-wide">{label}</h3>
      </div>
      {children}
    </div>
  );
}

function IconBadge({
  children,
  tone = "accent",
}: {
  children: React.ReactNode;
  tone?: "accent" | "danger";
}) {
  const toneClasses =
    tone === "danger" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700";
  return (
    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${toneClasses}`}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-lg bg-stone-900 px-6 py-3.5 text-base font-medium text-white shadow-sm transition-colors duration-150 hover:bg-stone-800 active:bg-stone-950 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-lg border border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 transition-colors duration-150 hover:border-stone-400 hover:bg-stone-50"
    >
      {children}
    </button>
  );
}

// ---------- 圖示（純線條 SVG，取代表情符號，維持專業質感） ----------

function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 11h6M9 15h6" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 6.5 12 13l8.5-6.5" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.3 3.9 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
      />
    </svg>
  );
}

function IconChartBar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M8 17v-6M13 17V7M18 17v-4" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5 11 15l4.5-5" />
    </svg>
  );
}

function IconLightbulb() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.4.3.6.8.6 1.3V16h5.8v-.8c0-.5.2-1 .6-1.3A6 6 0 0 0 12 3Z"
      />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2"
      />
    </svg>
  );
}

function IconFileText() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 5a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z"
      />
    </svg>
  );
}

// ---------- 畫面 ----------

// 每個動物型一句話預告，只透露個性、不透露「哪個比較好」，
// 保留測驗選項本身的懸念（跟 data/questions.ts 的設計目的一致）。
const STYLE_TEASERS: Record<ParentingStyleCode, string> = {
  helicopter: "時刻警覺，寸步不離",
  lawnmower: "未雨綢繆，先把路鋪好",
  tiger: "雷厲風行，說一不二",
  permissive: "心太軟，一哭就投降",
  gentle: "溫暖擁抱，也劃好界線",
  uninvolved: "隨緣放養，海闊天空",
};

const HOW_IT_WORKS: { icon: React.ReactNode; title: string; desc: string }[] = [
  { icon: <IconClipboard />, title: "走進森林故事", desc: `回答 ${QUESTIONS.length} 題情境題，憑直覺選擇` },
  { icon: <IconSparkles />, title: "AI 生成分析", desc: "根據你的作答傾向生成專屬解讀" },
  { icon: <IconFileText />, title: "領取專屬報告", desc: "留下 email，收到完整分析與建議" },
];

function LandingScreen({ onStart }: { onStart: () => void }) {
  const styleCodes = Object.keys(PARENTING_STYLES) as ParentingStyleCode[];

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Hero */}
      <section className="text-center">
        <IconBadge>
          <IconClipboard />
        </IconBadge>
        <p className="mt-4 text-xs font-medium tracking-wide text-amber-700">
          3 分鐘 · {QUESTIONS.length} 題情境測驗
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          {QUIZ_TITLE}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-stone-500 sm:text-base">
          你正要陪你的幼獸穿越森林，途中會遇到 {QUESTIONS.length} 個挑戰阻礙你們前進。
        </p>
        <div className="mx-auto mt-8 max-w-xs">
          <PrimaryButton onClick={onStart}>開始測驗，找出我的動物型</PrimaryButton>
          <p className="mt-3 text-center text-xs text-stone-400">
            完全匿名作答，僅需 email 即可領取完整分析報告
          </p>
        </div>
      </section>

      {/* 使用流程 */}
      <section className="grid gap-4 sm:grid-cols-3">
        {HOW_IT_WORKS.map((step, index) => (
          <div key={step.title} className="rounded-2xl border border-stone-200 bg-white p-5 text-center">
            <IconBadge>{step.icon}</IconBadge>
            <p className="mt-3 text-xs font-medium tracking-wide text-stone-400">
              STEP {index + 1}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-stone-900">{step.title}</h3>
            <p className="mt-1 text-xs text-stone-500">{step.desc}</p>
          </div>
        ))}
      </section>

      {/* 動物型預告 */}
      <section>
        <h2 className="text-center text-xs font-semibold tracking-wide text-stone-400 uppercase">
          森林裡的 6 種動物爸媽
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {styleCodes.map((code) => (
            <div key={code} className="rounded-xl border border-stone-200 bg-white p-4 text-center">
              <p className="text-sm font-semibold text-stone-900">{PARENTING_STYLES[code].name}</p>
              <p className="mt-1 text-xs text-stone-400">{STYLE_TEASERS[code]}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

function QuizScreen({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  onNext,
}: {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  onNext: () => void;
}) {
  const progress = Math.round(((questionIndex + 1) / totalQuestions) * 100);
  const isLastQuestion = questionIndex === totalQuestions - 1;

  return (
    <div>
      <div className="mb-6">
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200"
        >
          <div
            className="h-full rounded-full bg-amber-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs font-medium tracking-wide text-stone-400">
          第 {questionIndex + 1} 題／共 {totalQuestions} 題
        </p>
      </div>

      <div key={question.id} className="animate-fade-in-up">
        <Card>
          <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">{question.text}</h2>

          <fieldset className="mt-5 space-y-2.5 border-none p-0">
            <legend className="sr-only">{question.text}</legend>
            {question.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors duration-150 sm:text-base ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/60"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => onSelectOption(option.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isSelected ? "border-amber-600 bg-amber-600" : "border-stone-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        className="h-3 w-3 text-white"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className={isSelected ? "font-medium text-stone-900" : "text-stone-600"}>
                    {option.text}
                  </span>
                </label>
              );
            })}
          </fieldset>

          <div className="mt-6">
            <PrimaryButton onClick={onNext} disabled={!selectedOptionId}>
              {isLastQuestion ? "下一步：填寫 Email" : "下一題"}
            </PrimaryButton>
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmailScreen({
  email,
  onEmailChange,
  onSubmit,
  errorMessage,
}: {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  errorMessage: string;
}) {
  const isValid = EMAIL_REGEX.test(email.trim());

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
    onSubmit();
  }

  return (
    <Card>
      <div className="text-center">
        <IconBadge>
          <IconMail />
        </IconBadge>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
          最後一步：留下 email
        </h2>
        <p className="mt-2 text-sm text-stone-500">沒有填寫 email 無法看到測驗結果。</p>
      </div>

      <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-center text-base text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        />
        <PrimaryButton type="submit" disabled={!isValid}>
          送出並查看結果
        </PrimaryButton>
        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </form>
    </Card>
  );
}

function LoadingScreen() {
  return (
    <Card>
      <div role="status" className="flex flex-col items-center justify-center py-8 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-amber-600" />
        <p className="mt-5 text-sm font-medium text-stone-500 sm:text-base">
          AI 正在為你生成分析，請稍候…
        </p>
      </div>
    </Card>
  );
}

function ResultScreen({ data, onRestart }: { data: AnalyzeResultData; onRestart: () => void }) {
  const sortedScores = (Object.entries(data.scores) as [ParentingStyleCode, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  const maxScore = Math.max(1, ...sortedScores.map(([, score]) => score));

  // Dashboard 版面：左欄放「身分＋得分」這種一眼看懂的摘要資訊，
  // 右欄放要細讀的分析內容，兩欄各自獨立卡片。窄螢幕（lg 以下）
  // 直接照 DOM 順序疊成單欄，避免手機/平板跑版。
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-3 lg:items-start lg:gap-6">
        <div className="space-y-4 lg:sticky lg:top-8 lg:col-span-1">
          <Card>
            <div className="text-center">
              <p className="text-xs font-medium tracking-wide text-stone-400">{QUIZ_TITLE}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
                {data.styleName}
              </h2>
              <span className="mt-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium tracking-wide text-amber-700">
                {data.resultType}
              </span>
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-semibold tracking-wide text-stone-400 uppercase">
              各風格得分
            </h3>
            <div className="mt-3 space-y-2">
              {sortedScores.map(([code, score]) => {
                const isTop = code === data.resultType;
                return (
                  <div key={code} className="flex items-center gap-3 text-sm">
                    <span
                      className={`w-20 shrink-0 truncate ${
                        isTop ? "font-medium text-stone-900" : "text-stone-500"
                      }`}
                    >
                      {PARENTING_STYLES[code].name}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                      <span
                        className={`block h-full rounded-full transition-all duration-500 ${
                          isTop ? "bg-amber-600" : "bg-stone-300"
                        }`}
                        style={{ width: `${(score / maxScore) * 100}%` }}
                      />
                    </span>
                    <span
                      className={`w-6 shrink-0 text-right ${
                        isTop ? "font-medium text-stone-900" : "text-stone-500"
                      }`}
                    >
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="hidden lg:block">
            <SecondaryButton onClick={onRestart}>重新測驗</SecondaryButton>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {data.sections.analysis && (
            <Card>
              <SectionBlock label="分析" icon={<IconChartBar />}>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-stone-700 sm:text-base">
                  {data.sections.analysis}
                </p>
              </SectionBlock>
            </Card>
          )}

          {data.sections.evaluation && (
            <Card>
              <SectionBlock label="綜合評價" icon={<IconCheckCircle />}>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-stone-700 sm:text-base">
                  {data.sections.evaluation}
                </p>
              </SectionBlock>
            </Card>
          )}

          {data.sections.suggestions.length > 0 && (
            <Card>
              <SectionBlock label="建議" icon={<IconLightbulb />}>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {data.sections.suggestions.map((item, index) => (
                    <div key={index} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                      <span className="text-xs font-semibold text-amber-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="mt-1 text-sm leading-relaxed text-stone-700">{item}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            </Card>
          )}

          {data.sections.activity && (
            <Card>
              <SectionBlock label="親子小活動" icon={<IconHeart />}>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-stone-700 sm:text-base">
                  {data.sections.activity}
                </p>
              </SectionBlock>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-4 lg:hidden">
        <SecondaryButton onClick={onRestart}>重新測驗</SecondaryButton>
      </div>
    </div>
  );
}

function ErrorScreen({
  message,
  onRetry,
  onRestart,
}: {
  message: string;
  onRetry: () => void;
  onRestart: () => void;
}) {
  return (
    <Card>
      <div role="alert" className="text-center">
        <IconBadge tone="danger">
          <IconAlert />
        </IconBadge>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-stone-900">發生錯誤了</h2>
        <p className="mt-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {message || "發生未知錯誤，請稍後再試。"}
        </p>
      </div>
      <div className="mt-6 space-y-3">
        <PrimaryButton onClick={onRetry}>重試一次</PrimaryButton>
        <SecondaryButton onClick={onRestart}>重新開始測驗</SecondaryButton>
      </div>
    </Card>
  );
}
