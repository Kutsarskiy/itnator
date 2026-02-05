// src/core/selection/nextQuestion.ts
import type { Scores } from "@/core/scoring/scoring";

import {
  type Logger,
  type Question,
  getUsedWarmupTypesFromAnswered,
  pickWarmupQuestion,
  shouldContinueWarmup,
} from "@/core/selection/warmup";

import { pickTournamentQuestion } from "@/core/selection/tournament";

export type SelectionStage = "WARMUP" | "TOP_4" | "TOP_3" | "TOP_2";

const noopLogger: Logger = () => {
  // noop
};

export function pickNextQuestion(
  questions: Question[],
  answeredIds: number[],
  scores: Scores,
  answeredCount: number,
  logger: Logger = noopLogger,
  _warmupCountLegacy = 3,
  pool?: string[],
): Question {
  void _warmupCountLegacy;

  const remaining = questions.filter((q) => !answeredIds.includes(q.id));
  if (remaining.length === 0) {
    logger("NEXT_QUESTION_FALLBACK", { reason: "no_remaining" });
    return questions[0] ?? { id: 1, weights: {}, tags: [] };
  }

  const usedTypes = getUsedWarmupTypesFromAnswered(questions, answeredIds);

  const continueWarmup = shouldContinueWarmup(
    scores,
    answeredCount,
    usedTypes,
    logger,
    pool,
  );

  if (continueWarmup) {
    const pick = pickWarmupQuestion(questions, answeredIds, usedTypes, logger);
    logger("NEXT_QUESTION_WARMUP", {
      answeredCount,
      pick: pick.id,
    });
    return pick;
  }

  return pickTournamentQuestion(questions, answeredIds, scores, logger, pool);
}
