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

interface AnalyzeResultData {
  resultType: ParentingStyleCode;
  styleName: string;
  scores: Record<ParentingStyleCode, number>;
  result: string;
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

// 每個風格對應的表情符號跟配色，純粹是畫面裝飾用，不影響任何計分或
// API 邏輯——resultType 本身仍然是唯一的資料來源。
const STYLE_THEME: Record<
  ParentingStyleCode,
  { emoji: string; badge: string; bar: string; glow: string }
> = {
  helicopter: {
    emoji: "🚁",
    badge: "bg-sky-100 text-sky-700 ring-sky-300",
    bar: "bg-sky-400",
    glow: "from-sky-200",
  },
  lawnmower: {
    emoji: "🌾",
    badge: "bg-amber-100 text-amber-700 ring-amber-300",
    bar: "bg-amber-400",
    glow: "from-amber-200",
  },
  gentle: {
    emoji: "🤗",
    badge: "bg-rose-100 text-rose-700 ring-rose-300",
    bar: "bg-rose-400",
    glow: "from-rose-200",
  },
  freeRange: {
    emoji: "🦋",
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-300",
    bar: "bg-emerald-400",
    glow: "from-emerald-200",
  },
  techParenting: {
    emoji: "📱",
    badge: "bg-violet-100 text-violet-700 ring-violet-300",
    bar: "bg-violet-400",
    glow: "from-violet-200",
  },
  intensive: {
    emoji: "🎯",
    badge: "bg-indigo-100 text-indigo-700 ring-indigo-300",
    bar: "bg-indigo-400",
    glow: "from-indigo-200",
  },
};

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

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <BackgroundDecoration />

      <main className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div key={step} className="animate-fade-in-up">
          {step === "intro" && <IntroScreen onStart={handleStart} />}

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

function BackgroundDecoration() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-orange-200 to-transparent opacity-50 blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-gradient-to-bl from-rose-200 to-transparent opacity-50 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-gradient-to-tr from-amber-200 to-transparent opacity-40 blur-3xl" />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-xl shadow-orange-100/50 backdrop-blur-sm sm:p-8">
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-full bg-orange-400 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-200 transition-all duration-150 hover:bg-orange-500 hover:shadow-orange-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-full border-2 border-stone-200 bg-white px-6 py-3 text-base font-medium text-stone-600 transition-all duration-150 hover:border-orange-200 hover:text-orange-600 active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <Card>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
          🧸
        </div>
        <h1 className="text-2xl font-bold text-stone-800 sm:text-3xl">{QUIZ_TITLE}</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-stone-500 sm:text-base">
          回答 {QUESTIONS.length} 題日常育兒情境題，了解你的育兒風格傾向，測驗結束後留下 email
          即可取得 AI 為你生成的個人化分析與客觀建議。
        </p>
      </div>
      <div className="mt-8">
        <PrimaryButton onClick={onStart}>開始測驗 →</PrimaryButton>
      </div>
    </Card>
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
          className="h-2.5 w-full overflow-hidden rounded-full bg-orange-100"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-300 to-rose-300 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs font-medium tracking-wide text-orange-500">
          第 {questionIndex + 1} 題／共 {totalQuestions} 題
        </p>
      </div>

      <div key={question.id} className="animate-fade-in-up">
        <Card>
          <h2 className="text-lg font-bold text-stone-800 sm:text-xl">{question.text}</h2>

          <fieldset className="mt-5 space-y-3 border-none p-0">
            <legend className="sr-only">{question.text}</legend>
            {question.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 text-sm transition-all duration-150 sm:text-base ${
                    isSelected
                      ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
                      : "border-stone-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
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
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected ? "border-orange-500 bg-orange-500" : "border-stone-300 bg-white"
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
                  <span className={isSelected ? "font-medium text-stone-800" : "text-stone-600"}>
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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl">
          💌
        </div>
        <h2 className="text-xl font-bold text-stone-800 sm:text-2xl">
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
          className="w-full rounded-2xl border-2 border-stone-200 bg-white px-4 py-3 text-center text-base text-stone-800 outline-none transition-colors placeholder:text-stone-300 focus:border-orange-400"
        />
        <PrimaryButton type="submit" disabled={!isValid}>
          送出並查看結果
        </PrimaryButton>
        {errorMessage && (
          <p className="rounded-xl bg-rose-50 px-4 py-2 text-center text-sm text-rose-600">
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
        <div className="flex gap-2">
          <span className="h-3 w-3 animate-bounce rounded-full bg-orange-300 [animation-delay:-0.3s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-rose-300 [animation-delay:-0.15s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-amber-300" />
        </div>
        <p className="mt-5 text-sm font-medium text-stone-500 sm:text-base">
          AI 正在為你生成分析，請稍候…
        </p>
      </div>
    </Card>
  );
}

function ResultScreen({
  data,
  onRestart,
}: {
  data: AnalyzeResultData;
  onRestart: () => void;
}) {
  const sortedScores = (Object.entries(data.scores) as [ParentingStyleCode, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  const maxScore = Math.max(1, ...sortedScores.map(([, score]) => score));
  const theme = STYLE_THEME[data.resultType];

  return (
    <div>
      {/* 這張卡片本身就是設計成拿去截圖分享的樣子，資訊都收在這個容器裡。 */}
      <div
        className={`overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-b ${theme.glow} to-white shadow-xl shadow-orange-100/50`}
      >
        <div className="px-6 pt-8 pb-6 text-center sm:px-10">
          <div
            className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full text-4xl ring-4 ${theme.badge}`}
          >
            {theme.emoji}
          </div>
          <p className="text-sm font-medium text-stone-500">{QUIZ_TITLE}</p>
          <h2 className="mt-1 text-2xl font-bold text-stone-800 sm:text-3xl">
            你是「{data.styleName}」型
          </h2>
          <span
            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ring-1 ${theme.badge}`}
          >
            {data.resultType}
          </span>
        </div>

        <div className="bg-white/80 px-6 pb-8 sm:px-10">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600 sm:text-base">
            {data.result}
          </p>

          <div className="mt-6">
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-stone-400 uppercase">
              各風格得分
            </h3>
            <div className="space-y-2">
              {sortedScores.map(([code, score]) => (
                <div key={code} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 truncate text-xs text-stone-500 sm:w-32 sm:text-sm">
                    {PARENTING_STYLES[code].name}
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                    <span
                      className={`block h-full rounded-full ${STYLE_THEME[code].bar} transition-all duration-500`}
                      style={{ width: `${(score / maxScore) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 shrink-0 text-right font-medium text-stone-600">
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl">
          😥
        </div>
        <h2 className="text-xl font-bold text-stone-800">發生錯誤了</h2>
        <p className="mt-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
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
