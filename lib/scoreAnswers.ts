import { QUESTIONS, PARENTING_STYLES, type ParentingStyleCode } from "@/data/questions";

export class InvalidAnswersError extends Error {}

export interface ScoringResult {
  scores: Record<ParentingStyleCode, number>;
  resultType: ParentingStyleCode;
}

const STYLE_CODES = Object.keys(PARENTING_STYLES) as ParentingStyleCode[];

interface OptionLookup {
  questionId: string;
  weights: { style: ParentingStyleCode; weight: number }[];
}

const OPTION_LOOKUP = new Map<string, OptionLookup>();
for (const question of QUESTIONS) {
  for (const option of question.options) {
    OPTION_LOOKUP.set(option.id, { questionId: question.id, weights: option.weights });
  }
}

/**
 * Validates the submitted option ids against data/questions.ts and turns them
 * into per-style totals plus the winning style code (highest total; ties are
 * broken by the style's order in PARENTING_STYLES).
 */
export function scoreAnswers(answerIds: unknown): ScoringResult {
  if (!Array.isArray(answerIds)) {
    throw new InvalidAnswersError("answers 欄位必須是陣列。");
  }

  if (answerIds.length !== QUESTIONS.length) {
    throw new InvalidAnswersError(
      `answers 需要包含全部 ${QUESTIONS.length} 題的作答，目前收到 ${answerIds.length} 筆。`
    );
  }

  const answeredQuestionIds = new Set<string>();
  const scores = Object.fromEntries(STYLE_CODES.map((code) => [code, 0])) as Record<
    ParentingStyleCode,
    number
  >;

  for (const answerId of answerIds) {
    if (typeof answerId !== "string") {
      throw new InvalidAnswersError("每個答案都必須是選項 id 字串。");
    }

    const option = OPTION_LOOKUP.get(answerId);
    if (!option) {
      throw new InvalidAnswersError(
        `找不到選項 id「${answerId}」，請確認是否對應 data/questions.ts 中的題目選項。`
      );
    }

    if (answeredQuestionIds.has(option.questionId)) {
      throw new InvalidAnswersError(`題目「${option.questionId}」被重複作答，每題只能提供一個答案。`);
    }
    answeredQuestionIds.add(option.questionId);

    for (const { style, weight } of option.weights) {
      scores[style] += weight;
    }
  }

  const missingQuestionIds = QUESTIONS.map((q) => q.id).filter(
    (id) => !answeredQuestionIds.has(id)
  );
  if (missingQuestionIds.length > 0) {
    throw new InvalidAnswersError(`缺少以下題目的作答：${missingQuestionIds.join("、")}。`);
  }

  let resultType = STYLE_CODES[0];
  let bestScore = -Infinity;
  for (const code of STYLE_CODES) {
    if (scores[code] > bestScore) {
      bestScore = scores[code];
      resultType = code;
    }
  }

  return { scores, resultType };
}
