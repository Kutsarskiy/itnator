// src/core/selection/warmup.ts
import type { Scores } from "@/core/scoring/scoring";
import { getRanking, normalizedGap } from "@/core/selection/tournament";
import type { CoreQuestion } from "@/shared/types";

export type Logger = (event: string, payload?: unknown) => void;

const noopLogger: Logger = () => {
};

export type Question = CoreQuestion;

export type WarmupType =
  | "BUILD"
  | "LOGIC"
  | "TECH"
  | "PEOPLE"
  | "ORDER"
  | "MISC";

export const WARMUP_MIN = 3;

export const WARMUP_MAX = 5;

export const WARMUP_MIN_TYPES = 3;

export const OUTSIDER_GAP_TO_END = 0.22;

export const OUTSIDER_GAP_TO_END_SOFT = 0.18;

export const SOFT_END_AFTER = 4;

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const WARMUP_TYPE_TAGS: Record<WarmupType, string[]> = {
  BUILD: ["create", "build", "games", "development", "design", "ui", "visual"],
  LOGIC: [
    "logic",
    "puzzles",
    "math",
    "analysis",
    "data",
    "metrics",
    "comparison",
    "ai",
    "patterns",
  ],
  TECH: [
    "hardware",
    "devices",
    "iot",
    "robots",
    "internet",
    "networks",
    "systems",
    "protocols",
    "internals",
    "embedded",
    "real-time",
  ],
  PEOPLE: [
    "help",
    "product",
    "teamwork",
    "coordination",
    "communication",
    "people",
    "processes",
    "business",
    "users",
  ],
  ORDER: [
    "structure",
    "order",
    "requirements",
    "clarity",
    "documentation",
    "qa",
    "testing",
    "verification",
    "planning",
    "organization",
  ],
  MISC: [],
};

export function getWarmupType(q: Question): WarmupType {
  const tags = q.tags ?? [];
  for (const type of Object.keys(WARMUP_TYPE_TAGS) as WarmupType[]) {
    if (type === "MISC") continue;
    const bucket = WARMUP_TYPE_TAGS[type];
    if (tags.some((t) => bucket.includes(t))) return type;
  }
  return "MISC";
}

export function getUsedWarmupTypesFromAnswered(
  questions: Question[],
  answeredIds: number[],
): WarmupType[] {
  const byId = new Map<number, Question>(questions.map((q) => [q.id, q]));
  const used: WarmupType[] = [];
  for (const id of answeredIds) {
    const q = byId.get(id);
    if (!q) continue;
    used.push(getWarmupType(q));
  }
  return used;
}

export function shouldContinueWarmup(
  scores: Scores,
  answeredCount: number,
  usedWarmupTypes: WarmupType[],
  logger: Logger = noopLogger,
  pool?: string[],
): boolean {
  if (answeredCount < WARMUP_MIN) {
    logger("WARMUP_CONTINUE", { reason: "min_not_reached", answeredCount });
    return true;
  }

  if (answeredCount >= WARMUP_MAX) {
    logger("WARMUP_END", { reason: "max_reached", answeredCount });
    return false;
  }

  const distinctTypes = new Set(usedWarmupTypes.filter((t) => t !== "MISC"));
  if (distinctTypes.size < WARMUP_MIN_TYPES) {
    logger("WARMUP_CONTINUE", {
      reason: "types_not_covered",
      distinctTypes: Array.from(distinctTypes),
      needed: WARMUP_MIN_TYPES,
    });
    return true;
  }

  const ranking = getRanking(scores, pool);
  if (ranking.length < 5) {
    logger("WARMUP_END", { reason: "ranking_too_small", ranking });
    return false;
  }

  const s4 = ranking[3];
  const s5 = ranking[4];
  const gap45 = normalizedGap(scores, s4, s5);

  const hardOk = gap45 >= OUTSIDER_GAP_TO_END;

  const softOk =
    answeredCount >= SOFT_END_AFTER && gap45 >= OUTSIDER_GAP_TO_END_SOFT;

  const okToEnd = hardOk || softOk;

  logger(okToEnd ? "WARMUP_END" : "WARMUP_CONTINUE", {
    reason: okToEnd
      ? hardOk
        ? "outsiders_clear_hard"
        : "outsiders_clear_soft"
      : "outsiders_not_clear",
    gap45,
    thresholds: {
      hard: OUTSIDER_GAP_TO_END,
      soft: OUTSIDER_GAP_TO_END_SOFT,
      softAfter: SOFT_END_AFTER,
    },
    bottomCandidates: {
      s4,
      s5,
      score4: scores[s4] ?? 0,
      score5: scores[s5] ?? 0,
    },
    distinctTypes: Array.from(distinctTypes),
    answeredCount,
  });

  return !okToEnd;
}

export function pickWarmupQuestion(
  questions: Question[],
  answeredIds: number[],
  usedWarmupTypes: WarmupType[],
  logger: Logger = noopLogger,
): Question {
  const remaining = questions.filter((q) => !answeredIds.includes(q.id));
  if (remaining.length === 0) {
    logger("WARMUP_FALLBACK", { reason: "no_remaining" });
    return questions[0] ?? { id: 1, weights: {}, tags: [] };
  }

  const used = new Set(usedWarmupTypes.filter((t) => t !== "MISC"));

  const tier1 = remaining.filter((q) => {
    const t = getWarmupType(q);
    return t !== "MISC" && !used.has(t);
  });

  const tier2 = remaining.filter((q) => {
    const t = getWarmupType(q);
    return t === "MISC" || !used.has(t);
  });

  const pickFrom =
    tier1.length > 0 ? tier1 : tier2.length > 0 ? tier2 : remaining;
  const pick = randomFrom(pickFrom);

  logger("WARMUP_PICK", {
    pick: pick.id,
    pickType: getWarmupType(pick),
    tier1: tier1.length,
    tier2: tier2.length,
    remaining: remaining.length,
    usedTypes: Array.from(used),
  });

  return pick;
}
