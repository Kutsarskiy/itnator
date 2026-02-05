// src/core/selection/tournament.ts
import type { Scores } from "@/core/scoring/scoring";
import type { CoreQuestion } from "@/shared/types";

export type Logger = (message: string, data?: unknown) => void;

const noopLogger: Logger = () => {
};

export type SelectionStage = "TOP_4" | "TOP_3" | "TOP_2";

export type Question = CoreQuestion;

export const GAP_34_TO_ADVANCE = 0.35; // TOP_4 -> TOP_3
export const GAP_23_TO_ADVANCE = 0.35; // TOP_3 -> TOP_2

export function normalizedRange(scores: Scores) {
  const values = Object.values(scores);
  return Math.max(Math.max(...values) - Math.min(...values), 1);
}

export function normalizedGap(scores: Scores, a: string, b: string) {
  const range = normalizedRange(scores);
  return ((scores[a] ?? 0) - (scores[b] ?? 0)) / range;
}

export function getRanking(scores: Scores, pool?: string[]) {
  const entries = Object.entries(scores);
  const filtered = pool ? entries.filter(([id]) => pool.includes(id)) : entries;
  return filtered.sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

export function stageFromPool(pool: string[]): SelectionStage {
  if (pool.length >= 4) return "TOP_4";
  if (pool.length === 3) return "TOP_3";
  return "TOP_2";
}

export function pickTournamentQuestion(
  questions: Question[],
  answeredIds: number[],
  scores: Scores,
  logger: Logger = noopLogger,
  pool?: string[],
): Question {
  const remaining = questions.filter((q) => !answeredIds.includes(q.id));
  if (remaining.length === 0) {
    logger("NEXT_QUESTION_FALLBACK", { reason: "no_remaining" });
    return questions[0] ?? { id: 1, weights: {}, tags: [] };
  }

  const ranking = getRanking(scores, pool);
  const stage = pool ? stageFromPool(pool) : "TOP_3";

  logger("SELECTION_STAGE", {
    stage,
    ranking,
    pool,
  });

  let bestQ = remaining[0];
  let bestScore = -Infinity;

  for (const q of remaining) {
    const w = (id: string) => q.weights[id] ?? 0;

    let score = 0;

    if (stage === "TOP_4") {
      const s3 = ranking[2];
      const s4 = ranking[3];
      if (!s3 || !s4) continue;
      score = Math.abs(w(s3) - w(s4));
    } else if (stage === "TOP_3") {
      const s2 = ranking[1];
      const s3 = ranking[2];
      if (!s2 || !s3) continue;
      score = Math.abs(w(s2) - w(s3));
    } else {
      const s1 = ranking[0];
      const s2 = ranking[1];
      if (!s1 || !s2) continue;
      score = Math.abs(w(s1) - w(s2));
    }

    if (score > bestScore) {
      bestScore = score;
      bestQ = q;
    }
  }

  logger("NEXT_QUESTION_GREEDY", { pick: bestQ.id, bestScore, stage });
  return bestQ;
}
