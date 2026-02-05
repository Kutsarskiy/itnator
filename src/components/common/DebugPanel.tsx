import { useMemo, useState } from "react";

import questionsData from "@/data/questions.json";
import specialtiesData from "@/data/specialties.json";
import type { AnswerValue } from "@/store/quizStore";
import type { QuizQuestion, Specialty } from "@/shared/types";

type DebugPanelProps = {
  logs: string[];
};

type LogEventType =
  | "ANSWER"
  | "SCORES_AFTER"
  | "RANKING"
  | "OUTCOME_CHECK"
  | "NEXT_QUESTION"
  | "NEXT_QUESTION_RANDOM"
  | "NEXT_QUESTION_GREEDY"
  | "SELECTION_STAGE"
  | "POOL_INIT"
  | "POOL_ADVANCE"
  | "POOL_GAP"
  | "OTHER";

type SelectionStage = "WARMUP" | "TOP_4" | "TOP_3" | "TOP_2";

type Scores = Record<string, number>;

type LogEvent = {
  type: LogEventType;
  data?: unknown;
  raw: string;
};

const ANSWER_LABELS: Record<AnswerValue, string> = {
  yes: "Так",
  rather_yes: "Скоріше так",
  idk: "Не знаю",
  rather_no: "Скоріше ні",
  no: "Ні",
};

function parseLogLine(line: string): LogEvent {
  const spaceIdx = line.indexOf(" ");
  const typeCandidate = (spaceIdx === -1 ? line : line.slice(0, spaceIdx))
    .trim()
    .toUpperCase();

  const known: Set<LogEventType> = new Set([
    "ANSWER",
    "SCORES_AFTER",
    "RANKING",
    "OUTCOME_CHECK",
    "NEXT_QUESTION",
    "NEXT_QUESTION_RANDOM",
    "NEXT_QUESTION_GREEDY",
    "SELECTION_STAGE",
    "POOL_INIT",
    "POOL_ADVANCE",
    "POOL_GAP",
    "OTHER",
  ]);

  const type = (
    known.has(typeCandidate as LogEventType)
      ? (typeCandidate as LogEventType)
      : "OTHER"
  ) as LogEventType;

  const jsonPart = spaceIdx === -1 ? "" : line.slice(spaceIdx + 1).trim();
  if (!jsonPart) return { type, raw: line };

  try {
    const data = JSON.parse(jsonPart);
    return { type, data, raw: line };
  } catch {
    return { type, raw: line };
  }
}

function pillClass(kind: "ok" | "warn" | "neutral") {
  if (kind === "ok")
    return "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/25";
  if (kind === "warn")
    return "bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/25";
  return "bg-white/10 text-white/80 ring-1 ring-white/15";
}

function stageLabel(stage: SelectionStage) {
  if (stage === "WARMUP") return "Розминка";
  if (stage === "TOP_4") return "Турнір · топ-4";
  if (stage === "TOP_3") return "Турнір · топ-3";
  return "Турнір · топ-2";
}

function scoreRows(scores: Scores, specMap: Record<string, string>) {
  return Object.entries(scores)
    .map(([id, value]) => ({
      id,
      value,
      name: specMap[id] ?? id,
    }))
    .sort((a, b) => b.value - a.value);
}

export function DebugPanel({ logs }: DebugPanelProps) {
  const [minimized, setMinimized] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const questionsMap = useMemo(() => {
    const arr = questionsData as QuizQuestion[];
    const map: Record<number, string> = {};
    for (const q of arr) map[q.id] = q.textUk;
    return map;
  }, []);

  const specMap = useMemo(() => {
    const arr = specialtiesData as Specialty[];
    const map: Record<string, string> = {};
    for (const s of arr) map[s.id] = s.nameUk;
    return map;
  }, []);

  const events = useMemo(() => logs.map(parseLogLine), [logs]);

  const summary = useMemo(() => {
    let lastAnswer: { id: number; value: AnswerValue } | null = null;
    let lastScores: Scores | null = null;
    let lastOutcome: { outcome: string; answeredCount?: number } | null = null;
    let lastStage: SelectionStage | null = null;
    let lastStageRanking: string[] | null = null;
    let lastPool: string[] | null = null;
    let lastPoolAdvance: { from?: string; to?: string } | null = null;
    let lastGap: {
      stage?: string;
      pair?: string;
      gap?: number;
      threshold?: number;
    } | null = null;
    let lastWarmupPick: { answeredCount?: number; pick?: number } | null = null;
    let lastNextQuestionId: number | null = null;

    for (const e of events) {
      if (e.type === "ANSWER" && e.data && typeof e.data === "object") {
        const d = e.data as { id?: number; value?: AnswerValue };
        if (typeof d.id === "number" && typeof d.value === "string") {
          lastAnswer = { id: d.id, value: d.value };
        }
      }

      if (e.type === "SCORES_AFTER" && e.data && typeof e.data === "object") {
        lastScores = e.data as Scores;
      }

      if (e.type === "OUTCOME_CHECK" && e.data && typeof e.data === "object") {
        const d = e.data as { outcome?: string; answeredCount?: number };
        if (typeof d.outcome === "string") {
          lastOutcome = { outcome: d.outcome, answeredCount: d.answeredCount };
        }
      }

      if (e.type === "POOL_INIT" && e.data && typeof e.data === "object") {
        const d = e.data as { pool?: string[] };
        if (Array.isArray(d.pool)) lastPool = d.pool;
      }

      if (e.type === "POOL_ADVANCE" && e.data && typeof e.data === "object") {
        const d = e.data as { pool?: string[]; from?: string; to?: string };
        if (Array.isArray(d.pool)) lastPool = d.pool;
        lastPoolAdvance = { from: d.from, to: d.to };
      }

      if (e.type === "POOL_GAP" && e.data && typeof e.data === "object") {
        lastGap = e.data as {
          stage?: string;
          pair?: string;
          gap?: number;
          threshold?: number;
        };
      }

      if (
        e.type === "SELECTION_STAGE" &&
        e.data &&
        typeof e.data === "object"
      ) {
        const d = e.data as {
          stage?: SelectionStage;
          ranking?: string[];
          pool?: string[] | null;
        };
        if (d.stage) lastStage = d.stage;
        if (Array.isArray(d.ranking)) lastStageRanking = d.ranking;
        if (Array.isArray(d.pool)) lastPool = d.pool;
      }

      if (
        e.type === "NEXT_QUESTION_RANDOM" &&
        e.data &&
        typeof e.data === "object"
      ) {
        const d = e.data as {
          warmup?: boolean;
          answeredCount?: number;
          pick?: number;
        };
        if (d.warmup)
          lastWarmupPick = { answeredCount: d.answeredCount, pick: d.pick };
      }

      if (e.type === "NEXT_QUESTION_GREEDY") {
        lastWarmupPick = null;
      }

      if (e.type === "NEXT_QUESTION" && e.data && typeof e.data === "object") {
        const d = e.data as { id?: number };
        if (typeof d.id === "number") lastNextQuestionId = d.id;
      }
    }

    const outcome = lastOutcome?.outcome ?? "in_progress";
    const stage: SelectionStage =
      lastStage ?? (lastWarmupPick ? "WARMUP" : "WARMUP");
    const algorithmRunning = stage !== "WARMUP" && outcome === "in_progress";

    const currentQid = lastNextQuestionId ?? lastWarmupPick?.pick ?? null;
    const currentQtext = currentQid ? questionsMap[currentQid] : undefined;

    const lastAnswerText = lastAnswer
      ? {
          qid: lastAnswer.id,
          qtext: questionsMap[lastAnswer.id],
          value: lastAnswer.value,
          label: ANSWER_LABELS[lastAnswer.value] ?? lastAnswer.value,
        }
      : null;

    const rows = lastScores ? scoreRows(lastScores, specMap) : [];

    return {
      outcome,
      stage,
      algorithmRunning,
      currentQid,
      currentQtext,
      lastAnswer: lastAnswerText,
      scoreRows: rows,
      stageRanking: lastStageRanking,
      pool: lastPool,
      poolAdvance: lastPoolAdvance,
      gap: lastGap,
      answeredCount: lastOutcome?.answeredCount,
    };
  }, [events, questionsMap, specMap]);

  return (
    <div
      className={[
        "fixed right-4 bottom-16 z-50",
        "w-[460px] max-w-[calc(100vw-2rem)]",
        "rounded-2xl border border-white/20 bg-black/70",
        "text-white shadow-[0_30px_80px_-45px_rgba(0,0,0,0.85)]",
        "backdrop-blur-xl",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-white/70" />
          <div className="text-sm font-semibold">Debug · Айтінатор</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xs text-white/80 hover:bg-white/10"
            onClick={() => setShowRaw((v) => !v)}
          >
            {showRaw ? "Сховати сирі логи" : "Показати сирі логи"}
          </button>

          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xs text-white/80 hover:bg-white/10"
            onClick={() => setMinimized((v) => !v)}
          >
            {minimized ? "Розгорнути" : "Згорнути"}
          </button>
        </div>
      </div>

      {!minimized ? (
        <div className="max-h-[56vh] overflow-auto p-3">
          {logs.length === 0 ? (
            <div className="mb-3 rounded-2xl border border-white/10 bg-white/6 p-3 text-sm text-white/70">
              Логів ще немає — але дебаггер уже відкритий
              <br />
              Зʼявляться після першої події в алгоритмі/відповіді.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full px-2 py-1 text-[11px]",
                pillClass("neutral"),
              ].join(" ")}
            >
              Стадія:{" "}
              <span className="font-semibold">{stageLabel(summary.stage)}</span>
            </span>

            <span
              className={[
                "rounded-full px-2 py-1 text-[11px]",
                pillClass(summary.algorithmRunning ? "ok" : "warn"),
              ].join(" ")}
            >
              Алгоритм:{" "}
              <span className="font-semibold">
                {summary.algorithmRunning ? "працює" : "пауза"}
              </span>
            </span>

            <span
              className={[
                "rounded-full px-2 py-1 text-[11px]",
                pillClass("neutral"),
              ].join(" ")}
            >
              Outcome: <span className="font-semibold">{summary.outcome}</span>
              {typeof summary.answeredCount === "number" ? (
                <span className="text-white/60">
                  {" "}
                  · answered: {summary.answeredCount}
                </span>
              ) : null}
            </span>

            {summary.pool?.length ? (
              <span
                className={[
                  "rounded-full px-2 py-1 text-[11px]",
                  pillClass("neutral"),
                ].join(" ")}
              >
                Pool:{" "}
                <span className="font-semibold">{summary.pool.length}</span>
                <span className="text-white/60">
                  {" "}
                  · {summary.pool.join(", ")}
                </span>
              </span>
            ) : null}
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/6 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold text-white/85">
                Поточне питання
              </div>
              {summary.currentQid ? (
                <div className="text-[11px] text-white/55">
                  ID: {summary.currentQid}
                </div>
              ) : null}
            </div>

            <div className="text-sm leading-snug text-white/80">
              {summary.currentQtext ?? "(ще не зафіксовано у логах)"}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/6 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold text-white/85">
                Остання відповідь
              </div>
              {summary.lastAnswer?.qid ? (
                <div className="text-[11px] text-white/55">
                  QID: {summary.lastAnswer.qid}
                </div>
              ) : null}
            </div>

            {summary.lastAnswer ? (
              <>
                <div className="text-sm leading-snug text-white/80">
                  {summary.lastAnswer.qtext ?? "(текст питання не знайдено)"}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={[
                      "rounded-full px-2 py-1 text-[11px]",
                      pillClass("neutral"),
                    ].join(" ")}
                  >
                    Відповідь:{" "}
                    <span className="font-semibold">
                      {summary.lastAnswer.label}
                    </span>
                  </span>
                </div>
              </>
            ) : (
              <div className="text-sm text-white/60">(ще немає відповіді)</div>
            )}
          </div>

          {summary.poolAdvance || summary.gap || summary.stageRanking ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/6 p-3">
              <div className="mb-2 text-xs font-semibold text-white/85">
                Турнір
              </div>

              {summary.poolAdvance?.from || summary.poolAdvance?.to ? (
                <div className="text-xs text-white/75">
                  Advance:{" "}
                  <span className="font-semibold">
                    {summary.poolAdvance.from ?? "?"}
                  </span>{" "}
                  →{" "}
                  <span className="font-semibold">
                    {summary.poolAdvance.to ?? "?"}
                  </span>
                </div>
              ) : null}

              {summary.gap?.gap !== undefined ? (
                <div className="mt-1 text-xs text-white/75">
                  Gap {summary.gap.pair ?? ""}:{" "}
                  <span className="font-semibold">
                    {Number(summary.gap.gap).toFixed(3)}
                  </span>
                  {summary.gap.threshold !== undefined ? (
                    <span className="text-white/55">
                      {" "}
                      · thr {Number(summary.gap.threshold).toFixed(2)}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {summary.stageRanking?.length ? (
                <div className="mt-2 text-xs text-white/70">
                  Ranking:{" "}
                  <span className="font-semibold">
                    {summary.stageRanking.join(" → ")}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/6 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold text-white/85">
                Скорінг-модель (від більшого до меншого)
              </div>
              <div className="text-[11px] text-white/55">
                {summary.scoreRows.length
                  ? `${summary.scoreRows.length} спец.`
                  : "—"}
              </div>
            </div>

            {summary.scoreRows.length ? (
              <div className="space-y-1">
                {summary.scoreRows.map((r, idx) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-2 py-1"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-white/55">
                          #{idx + 1}
                        </span>
                        <span className="truncate text-xs font-semibold text-white/85">
                          {r.name}
                        </span>
                        <span className="text-[11px] text-white/50">
                          ({r.id})
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 font-mono text-xs text-white/80">
                      {r.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/60">
                (немає даних по скору — дочекайся першої відповіді)
              </div>
            )}
          </div>

          {showRaw ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/6 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold text-white/85">
                  Сирі логи (останні 100)
                </div>
                <div className="text-[11px] text-white/55">
                  всього: {logs.length}
                </div>
              </div>

              <ul className="space-y-1">
                {logs.slice(-100).map((l, i) => (
                  <li
                    key={i}
                    className="break-words font-mono text-[11px] text-white/60"
                  >
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full px-2 py-1 text-[11px]",
                pillClass("neutral"),
              ].join(" ")}
            >
              {stageLabel(summary.stage)}
            </span>
            <span
              className={[
                "rounded-full px-2 py-1 text-[11px]",
                pillClass(summary.algorithmRunning ? "ok" : "warn"),
              ].join(" ")}
            >
              {summary.algorithmRunning
                ? "Алгоритм працює"
                : "Алгоритм на паузі"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
