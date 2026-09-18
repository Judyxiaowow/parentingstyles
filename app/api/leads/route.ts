import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { PARENTING_STYLES, type ParentingStyleCode } from "@/data/questions";
import { connectToDatabase } from "@/lib/mongodb";
import { InvalidAnswersError, scoreAnswers } from "@/lib/scoreAnswers";
import LeadModel from "@/models/Lead";

// Public endpoint — quiz takers are not authenticated, so every field is
// validated defensively before it ever reaches the database.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254; // RFC 5321 mailbox length limit
const MAX_RESULT_LENGTH = 1000;

interface LeadsSuccessResponse {
  status: "success";
  data: {
    email: string;
    resultType: ParentingStyleCode;
    createdAt: string;
    updated: boolean;
  };
}

interface LeadsErrorResponse {
  status: "error";
  message: string;
}

export async function POST(
  request: Request
): Promise<NextResponse<LeadsSuccessResponse | LeadsErrorResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "請提供有效的 JSON 格式請求內容。" },
      { status: 400 }
    );
  }

  const { email, answers, result, resultType } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || email.trim() === "") {
    return NextResponse.json({ status: "error", message: "email 為必填欄位。" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(normalizedEmail)) {
    return NextResponse.json(
      { status: "error", message: "email 格式不正確，請確認後再試一次。" },
      { status: 400 }
    );
  }

  let validatedAnswers: string[];
  try {
    scoreAnswers(answers);
    validatedAnswers = answers as string[];
  } catch (err) {
    const message =
      err instanceof InvalidAnswersError ? err.message : "answers 格式不正確，請確認後再試一次。";
    return NextResponse.json({ status: "error", message }, { status: 400 });
  }

  if (typeof result !== "string" || result.trim() === "") {
    return NextResponse.json(
      { status: "error", message: "result 為必填欄位，且必須是文字。" },
      { status: 400 }
    );
  }
  if (result.length > MAX_RESULT_LENGTH) {
    return NextResponse.json(
      { status: "error", message: `result 長度不可超過 ${MAX_RESULT_LENGTH} 字。` },
      { status: 400 }
    );
  }

  if (typeof resultType !== "string" || !(resultType in PARENTING_STYLES)) {
    return NextResponse.json(
      {
        status: "error",
        message: `resultType 不正確，必須是以下其中之一：${Object.keys(PARENTING_STYLES).join("、")}。`,
      },
      { status: 400 }
    );
  }
  const validatedResultType = resultType as ParentingStyleCode;

  const update = {
    $set: {
      email: normalizedEmail,
      answers: validatedAnswers,
      result: result.trim(),
      resultType: validatedResultType,
    },
  };

  try {
    await connectToDatabase();

    const rawResult = await LeadModel.findOneAndUpdate({ email: normalizedEmail }, update, {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      includeResultMetadata: true,
    });

    const doc = rawResult.value;
    if (!doc) {
      throw new Error("寫入資料庫後未取得結果文件。");
    }

    return NextResponse.json({
      status: "success",
      data: {
        email: doc.email,
        resultType: doc.resultType as ParentingStyleCode,
        createdAt: (doc.createdAt ?? new Date()).toISOString(),
        updated: rawResult.lastErrorObject?.updatedExisting ?? false,
      },
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      // Two concurrent upserts for a brand-new email can both miss the
      // "not found" check and race to insert; MongoDB's unique index then
      // rejects the loser with E11000. Retry once as a plain update — by
      // now the winner's document exists, so this becomes the "update"
      // path the requirement (upsert, never duplicate) actually wants.
      try {
        await connectToDatabase();
        const doc = await LeadModel.findOneAndUpdate({ email: normalizedEmail }, update, {
          new: true,
          runValidators: true,
        });
        if (doc) {
          return NextResponse.json({
            status: "success",
            data: {
              email: doc.email,
              resultType: doc.resultType as ParentingStyleCode,
              createdAt: (doc.createdAt ?? new Date()).toISOString(),
              updated: true,
            },
          });
        }
      } catch (retryErr) {
        return NextResponse.json(
          { status: "error", message: toReadableDbErrorMessage(retryErr) },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { status: "error", message: toReadableDbErrorMessage(err) },
      { status: 500 }
    );
  }
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === 11000
  );
}

function toReadableDbErrorMessage(err: unknown): string {
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return `資料驗證失敗：${messages.join("；")}`;
  }
  if (err instanceof Error) {
    return `寫入資料庫時發生錯誤：${err.message}`;
  }
  return "寫入資料庫時發生未知錯誤。";
}
