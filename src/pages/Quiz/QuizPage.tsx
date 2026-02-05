import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import questionsData from "@/data/questions.json";
import type { QuizQuestion } from "@/shared/types";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/app/routes";
import { useQuizStore, type AnswerValue } from "@/store/quizStore";
import { DebugPanel } from "@/components/common/DebugPanel";

type Answer = {
  value: AnswerValue;
  label: string;
};

const guessingMascots = Object.values(
  import.meta.glob("/src/assets/mascot/Guessing_*.png", {
    eager: true,
    import: "default",
  }),
) as string[];

const MAX_QUESTIONS = 15;

const MASCOT_ORDER_KEY = "itn_quiz_guessing_mascot_order_v1";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readMascotOrder(): string[] | null {
  try {
    const raw = sessionStorage.getItem(MASCOT_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter((x): x is string => typeof x === "string");
    return list.length ? list : null;
  } catch {
    return null;
  }
}

function writeMascotOrder(list: string[]) {
  try {
    sessionStorage.setItem(MASCOT_ORDER_KEY, JSON.stringify(list));
  } catch {
    // ignore (storage may be blocked)
  }
}

function clearMascotOrder() {
  try {
    sessionStorage.removeItem(MASCOT_ORDER_KEY);
  } catch {
    // ignore
  }
}

function ensureSessionMascotOrder(): string[] {
  if (guessingMascots.length === 0) return [];

  const existing = readMascotOrder();
  if (existing && existing.length > 0) return existing;

  const shuffled = shuffle(guessingMascots);

  const picked = shuffled.slice(0, Math.min(MAX_QUESTIONS, shuffled.length));
  writeMascotOrder(picked);
  return picked;
}

function mascotAtStep(order: string[], answeredCount: number): string {
  if (order.length === 0) return "";
  const idx = Math.min(answeredCount, order.length - 1);
  return order[idx] ?? order[0] ?? "";
}

export function QuizPage() {
  const navigate = useNavigate();
  const contentH = "h-[calc(100dvh-3.5rem-3rem)]";

  const questions = useMemo<QuizQuestion[]>(() => {
    const arr = (questionsData as QuizQuestion[]).slice();
    arr.sort((a, b) => a.id - b.id);
    return arr;
  }, []);

  const currentQuestionId = useQuizStore((s) => s.currentQuestionId);
  const answeredIds = useQuizStore((s) => s.answeredIds);
  const answersByQuestionId = useQuizStore((s) => s.answersByQuestionId);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const next = useQuizStore((s) => s.next);
  const outcome = useQuizStore((s) => s.outcome);
  const reset = useQuizStore((s) => s.reset);
  const debugLogs = useQuizStore((s) => s.logs ?? []);

  const [debugOpen, setDebugOpen] = useState(false);

  const [mascotOrder, setMascotOrder] = useState<string[]>(() =>
    ensureSessionMascotOrder(),
  );

  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    if (outcome !== "in_progress") {
      clearMascotOrder();
      reset();

      // eslint-friendly: не викликаємо setState синхронно в effect
      queueMicrotask(() => {
        setMascotOrder(ensureSessionMascotOrder());
      });
    }
  }, [outcome, reset]);

  useEffect(() => {
    if (outcome === "win") navigate(ROUTES.resultWinIntro, { replace: true });
    if (outcome === "lose") navigate(ROUTES.resultLose, { replace: true });
  }, [outcome, navigate]);

  const q = questions.find((x) => x.id === currentQuestionId) ?? questions[0];
  const questionId = q?.id ?? 1;
  const questionText = q?.textUk ?? "Питання завантажується…";

  const selected: AnswerValue | null = answersByQuestionId[questionId] ?? null;

  const answers = useMemo<Answer[]>(
    () => [
      { value: "yes", label: "Так" },
      { value: "rather_yes", label: "Скоріше так" },
      { value: "idk", label: "Не знаю" },
      { value: "rather_no", label: "Скоріше ні" },
      { value: "no", label: "Ні" },
    ],
    [],
  );

  const canGoNext = selected !== null;

  const answeredCount = answeredIds.length;
  const stepNo = Math.min(answeredCount + 1, MAX_QUESTIONS);

  const mascotSrc = useMemo(
    () => mascotAtStep(mascotOrder, answeredCount),
    [mascotOrder, answeredCount],
  );

  return (
    <section className={["relative", contentH, "overflow-hidden"].join(" ")}>
      <div
        className={[
          "mx-auto flex items-center",
          contentH,
          "max-w-[1280px] px-6 md:px-10",
        ].join(" ")}
      >
        <div className="relative z-10 w-full max-w-[720px]">
          <div key={questionId} className="itn-reveal">
            <div className="relative overflow-hidden rounded-[28px] border border-white/30 bg-white/22 p-10 shadow-[0_50px_140px_-70px_rgba(0,0,0,0.55)] backdrop-blur-3xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_8%,rgba(255,255,255,0.80)_0%,rgba(255,255,255,0.22)_40%,rgba(255,255,255,0)_70%)]" />
              <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/18 blur-3xl" />
              <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-violet-500/16 blur-3xl" />

              <div className="relative">
                <div className="mb-4 text-center text-sm font-medium text-slate-700/65">
                  Питання {stepNo}/{MAX_QUESTIONS}
                </div>

                <h1 className="text-center text-4xl font-semibold tracking-tight text-slate-900 md:text-[44px] md:leading-tight">
                  {questionText}
                </h1>

                <div className="mt-10 overflow-hidden rounded-2xl border border-white/30 bg-white/18 backdrop-blur-2xl">
                  {answers.map((a, idx) => {
                    const isActive = selected === a.value;
                    const delayMs = 90 + idx * 55;

                    return (
                      <div
                        key={a.value}
                        className="relative itn-reveal"
                        style={{ animationDelay: `${delayMs}ms` }}
                      >
                        <button
                          type="button"
                          onClick={() => setAnswer(a.value)}
                          className={[
                            "group relative flex w-full items-center justify-between gap-4",
                            "px-8 py-[18px] text-left",
                            "isolate",
                            "transform-gpu will-change-transform",
                            "transition-[transform,background-color,box-shadow] duration-220 ease-out",
                            "hover:-translate-y-[1px]",
                            "hover:bg-white/14",
                            "hover:shadow-[0_16px_34px_rgba(0,0,0,0.08)]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                            "scale-100",
                          ].join(" ")}
                          aria-pressed={isActive}
                        >
                          <span
                            className={[
                              "relative z-10",
                              "text-lg font-semibold",
                              isActive ? "text-slate-900" : "text-slate-900/90",
                            ].join(" ")}
                          >
                            {a.label}
                          </span>

                          <span
                            className={[
                              "relative z-10",
                              "text-slate-900/55 transition-opacity duration-200",
                              isActive ? "opacity-100" : "opacity-0",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            ✓
                          </span>

                          <span
                            className={[
                              "pointer-events-none absolute inset-0 opacity-0",
                              "transition-opacity duration-200",
                              "group-hover:opacity-100",
                              "z-0",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            <span className="absolute inset-0 bg-[radial-gradient(120%_90%_at_14%_20%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.06)_42%,rgba(255,255,255,0)_72%)]" />
                            <span className="absolute inset-0 ring-1 ring-white/14" />
                          </span>

                          <span
                            className={[
                              "pointer-events-none absolute inset-0 opacity-0",
                              "transition-[opacity,transform] duration-200",

                              "z-0",
                              isActive
                                ? "opacity-100 scale-[1.01]"
                                : "opacity-0 scale-100",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            <span className="absolute inset-0 bg-linear-to-r from-cyan-400/14 via-blue-500/10 to-violet-500/12" />
                            <span className="absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_20%,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.10)_42%,rgba(255,255,255,0)_72%)]" />
                            <span className="absolute inset-0 ring-1 ring-white/22" />
                          </span>
                        </button>

                        {idx !== answers.length - 1 ? (
                          <div className="h-px bg-linear-to-r from-transparent via-slate-900/10 to-transparent" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-10 flex justify-center">
                  <Button
                    size="lg"
                    disabled={!canGoNext}
                    className={[
                      "group relative h-12 min-w-[260px] rounded-2xl",
                      canGoNext
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-600/90"
                        : "cursor-not-allowed bg-slate-900/10 text-slate-500 shadow-none hover:bg-slate-900/10",
                    ].join(" ")}
                    onClick={() => {
                      if (!canGoNext) return;
                      next();
                    }}
                  >
                    <span className="relative z-10 text-base font-semibold">
                      Далі →
                    </span>

                    {canGoNext ? (
                      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                        <span className="absolute -left-24 top-0 h-full w-40 rotate-12 bg-white/25 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </span>
                    ) : null}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden flex-1 md:block" />
      </div>

      <div className="pointer-events-none absolute right-2 top-1/2 z-0 -translate-y-1/2 md:right-6 lg:right-20">
        <div className="absolute -inset-24 -z-10 rounded-full bg-[radial-gradient(circle_at_55%_40%,rgba(56,189,248,0.35)_0%,rgba(99,102,241,0.18)_45%,rgba(168,85,247,0.12)_70%,rgba(255,255,255,0)_100%)] blur-3xl" />
        <div className="absolute -inset-28 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.07)_35%,rgba(255,255,255,0)_72%)] blur-2xl" />

        <div className="itn-mascot-wrap">
          <img
            src={mascotSrc}
            alt="Айтінатор"
            className="itn-mascot h-[74dvh] max-h-[780px] w-auto select-none object-contain md:h-[88dvh] md:max-h-[860px] lg:h-[96dvh] lg:max-h-[920px]"
            draggable={false}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDebugOpen((v) => !v)}
        aria-pressed={debugOpen}
        aria-label={debugOpen ? "Закрити дебаггер" : "Відкрити дебаггер"}
        className={[
          "fixed left-4 bottom-16 z-50",
          "h-10 w-10 rounded-lg",
          "bg-white text-slate-900",
          "cursor-pointer",
          "shadow-[0_18px_50px_-30px_rgba(0,0,0,0.55)]",
          "transition-[transform,background-color,box-shadow] duration-200 ease-out",
          "hover:-translate-y-[1px] hover:bg-white/95 hover:shadow-[0_22px_60px_-34px_rgba(0,0,0,0.65)]",
          "active:translate-y-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        ].join(" ")}
      >
        <span className="inline-flex h-full w-full items-center justify-center text-sm font-bold">
          i
        </span>
      </button>

      {debugOpen ? <DebugPanel logs={debugLogs} /> : null}
    </section>
  );
}
