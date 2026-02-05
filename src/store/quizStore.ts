import { create } from "zustand";

import questions from "@/data/questions.json";
import type { CoreQuestion } from "@/shared/types";

import { applyAnswer } from "@/core/scoring/scoring";
import { pickNextQuestion } from "@/core/selection/nextQuestion";
import {
  GAP_23_TO_ADVANCE,
  GAP_34_TO_ADVANCE,
  getRanking,
  normalizedGap,
  stageFromPool,
  type Logger,
} from "@/core/selection/tournament";
import {
  getUsedWarmupTypesFromAnswered,
  shouldContinueWarmup,
} from "@/core/selection/warmup";

export type AnswerValue = "yes" | "rather_yes" | "idk" | "rather_no" | "no";

type Scores = Record<string, number>;

export type QuizOutcome = "in_progress" | "win" | "lose";

type Question = CoreQuestion;

type AnswersByQuestionId = Record<number, AnswerValue | undefined>;

type State = {
  currentQuestionId: number;
  answeredIds: number[];
  answersByQuestionId: AnswersByQuestionId;

  pool: string[] | null;

  scores: Scores;

  outcome: QuizOutcome;
  logs: string[];

  setAnswer: (value: AnswerValue) => void;
  next: () => void;
  reset: () => void;
};

const MIN_QUESTIONS = 8;
const MAX_QUESTIONS = 15;

const WIN_GAP_12 = 0.22;

const initialScores: Scores = {
  "121": 0,
  "122": 0,
  "123": 0,
  "124": 0,
  "125": 0,
  "126": 0,
};

function randomStartQuestionId(qs: Question[]) {
  return qs[Math.floor(Math.random() * qs.length)]?.id ?? 1;
}

function pushLog(logs: string[], message: string, data?: unknown) {
  logs.push(
    `${message}${data !== undefined ? ` ${JSON.stringify(data)}` : ""}`,
  );
}

function initTop4Pool(scores: Scores): string[] {
  return getRanking(scores).slice(0, 4);
}

function maybeAdvancePool(
  pool: string[],
  scores: Scores,
  logger: Logger,
): string[] {
  const ranking = getRanking(scores, pool);
  const stage = stageFromPool(pool);

  if (stage === "TOP_4") {
    const s3 = ranking[2];
    const s4 = ranking[3];
    if (s3 && s4) {
      const gap34 = normalizedGap(scores, s3, s4);
      logger("POOL_GAP", {
        stage,
        pair: "3v4",
        gap: gap34,
        threshold: GAP_34_TO_ADVANCE,
      });
      if (gap34 >= GAP_34_TO_ADVANCE) {
        const next = ranking.slice(0, 3);
        logger("POOL_ADVANCE", { from: "TOP_4", to: "TOP_3", pool: next });
        return next;
      }
    }
    return pool;
  }

  if (stage === "TOP_3") {
    const s2 = ranking[1];
    const s3 = ranking[2];
    if (s2 && s3) {
      const gap23 = normalizedGap(scores, s2, s3);
      logger("POOL_GAP", {
        stage,
        pair: "2v3",
        gap: gap23,
        threshold: GAP_23_TO_ADVANCE,
      });
      if (gap23 >= GAP_23_TO_ADVANCE) {
        const next = ranking.slice(0, 2);
        logger("POOL_ADVANCE", { from: "TOP_3", to: "TOP_2", pool: next });
        return next;
      }
    }
    return pool;
  }

  return pool;
}

function decideOutcome(
  scores: Scores,
  answeredCount: number,
  answersByQuestionId: AnswersByQuestionId,
  pool: string[] | null,
  logger: Logger,
): QuizOutcome {
  // hard stop
  if (answeredCount >= MAX_QUESTIONS) {
    if (pool && pool.length === 2) {
      logger("OUTCOME_WIN_SOFT", {
        reason: "max_questions_reached_pool_2",
        answeredCount,
        pool,
      });
      return "win";
    }

    logger("OUTCOME_LOSE", {
      reason: "max_questions_reached_no_clear_pool",
      answeredCount,
      pool,
    });
    return "lose";
  }

  if (!pool) {
    logger("OUTCOME_SKIP", { reason: "warmup_no_pool", answeredCount });
    return "in_progress";
  }

  if (answeredCount < MIN_QUESTIONS) {
    logger("OUTCOME_SKIP", { reason: "min_not_reached", answeredCount, pool });
    return "in_progress";
  }

  // only decide when pool == 2
  if (pool.length !== 2) {
    logger("OUTCOME_SKIP", {
      reason: "pool_not_2",
      answeredCount,
      pool,
    });
    return "in_progress";
  }

  const ranking = getRanking(scores, pool);
  const s1 = ranking[0];
  const s2 = ranking[1];

  if (!s1 || !s2) {
    logger("OUTCOME_SKIP", { reason: "pool_ranking_invalid", ranking, pool });
    return "in_progress";
  }

  const idkCount = Object.values(answersByQuestionId).filter(
    (v) => v === "idk",
  ).length;

  const penalty = idkCount >= 10 ? 0.06 : 0;

  const gap12 = normalizedGap(scores, s1, s2);
  const confident = gap12 >= WIN_GAP_12 + penalty;

  if (confident) {
    logger("OUTCOME_WIN_CONFIDENT", {
      reason: "pool_2_gap_ok",
      answeredCount,
      pool,
      ranking,
      gap12,
      threshold: WIN_GAP_12 + penalty,
      idkCount,
    });
    return "win";
  }

  logger("OUTCOME_WIN_SOFT", {
    reason: "pool_2_min_reached_gap_small",
    answeredCount,
    pool,
    ranking,
    gap12,
    threshold: WIN_GAP_12 + penalty,
    idkCount,
  });
  return "win";
}

export const useQuizStore = create<State>((set, get) => ({
  currentQuestionId: randomStartQuestionId(questions as Question[]),
  answeredIds: [],
  answersByQuestionId: {},
  pool: null,
  scores: { ...initialScores },
  outcome: "in_progress",
  logs: [],

  reset: () => {
    set({
      currentQuestionId: randomStartQuestionId(questions as Question[]),
      answeredIds: [],
      answersByQuestionId: {},
      pool: null,
      scores: { ...initialScores },
      outcome: "in_progress",
      logs: [],
    });
  },

  setAnswer: (value: AnswerValue) => {
    set((state) => ({
      answersByQuestionId: {
        ...state.answersByQuestionId,
        [state.currentQuestionId]: value,
      },
    }));
  },

  next: () => {
    const qs = questions as Question[];
    const state = get();

    if (state.outcome !== "in_progress") return;

    const currentId = state.currentQuestionId;
    const selected = state.answersByQuestionId[currentId];
    if (!selected) return;

    const q = qs.find((x) => x.id === currentId);
    if (!q) return;

    const logs = [...state.logs];
    const logger: Logger = (m, d) => pushLog(logs, m, d);

    logger("ANSWER", { id: currentId, value: selected });

    const nextScores = applyAnswer(state.scores, q.weights, selected);
    logger("SCORES_AFTER", nextScores);

    const nextAnsweredIds = [...state.answeredIds, currentId];
    const answeredCount = nextAnsweredIds.length;

    const usedTypes = getUsedWarmupTypesFromAnswered(qs, nextAnsweredIds);
    const warmupContinues = shouldContinueWarmup(
      nextScores,
      answeredCount,
      usedTypes,
      logger,
      undefined,
    );

    let pool = state.pool;
    if (pool === null && !warmupContinues) {
      pool = initTop4Pool(nextScores);
      logger("POOL_INIT", { pool, answeredCount, reason: "warmup_finished" });
    }

    if (pool) {
      pool = maybeAdvancePool(pool, nextScores, logger);
    }

    const globalRanking = getRanking(nextScores);
    logger("RANKING_GLOBAL", globalRanking);

    const outcome = decideOutcome(
      nextScores,
      answeredCount,
      state.answersByQuestionId,
      pool,
      logger,
    );

    logger("OUTCOME_CHECK", { outcome, answeredCount, pool });

    if (outcome !== "in_progress") {
      set({
        scores: nextScores,
        answeredIds: nextAnsweredIds,
        pool,
        outcome,
        logs,
      });
      return;
    }

    const nextQ = pickNextQuestion(
      qs,
      nextAnsweredIds,
      nextScores,
      answeredCount,
      logger,
      3,
      pool ?? undefined,
    );

    logger("NEXT_QUESTION", { id: nextQ.id });

    set({
      scores: nextScores,
      answeredIds: nextAnsweredIds,
      currentQuestionId: nextQ.id,
      outcome: "in_progress",
      pool,
      logs,
    });
  },
}));
