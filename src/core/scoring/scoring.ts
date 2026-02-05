import type { AnswerValue } from "@/store/quizStore";

export const ANSWER_TO_SCORE: Record<AnswerValue, number> = {
  yes: 2,
  rather_yes: 1,
  idk: 0,
  rather_no: -1,
  no: -2,
};

export type Scores = Record<string, number>;

export function applyAnswer(
  scores: Scores,
  weights: Record<string, number>,
  answer: AnswerValue,
): Scores {
  const a = ANSWER_TO_SCORE[answer];
  const next: Scores = { ...scores };

  for (const specId of Object.keys(weights)) {
    next[specId] = (next[specId] ?? 0) + a * (weights[specId] ?? 0);
  }

  return next;
}

export function getRanking(scores: Scores): string[] {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

export function scoreRange(scores: Scores): number {
  const values = Object.values(scores);
  const max = Math.max(...values);
  const min = Math.min(...values);
  return Math.max(max - min, 1);
}

export function gapPercent(scores: Scores, a: string, b: string): number {
  const range = scoreRange(scores);
  return ((scores[a] ?? 0) - (scores[b] ?? 0)) / range;
}

export function isConfidentWinner(
  scores: Scores,
  minGap12 = 0.5,
  minGap13 = 0.35,
): boolean {
  const ranking = getRanking(scores);
  const s1 = ranking[0];
  const s2 = ranking[1];
  const s3 = ranking[2];

  if (!s1 || !s2) return false;
  const g12 = gapPercent(scores, s1, s2);
  const g13 = s3 ? gapPercent(scores, s1, s3) : g12;

  return g12 >= minGap12 && g13 >= minGap13;
}
