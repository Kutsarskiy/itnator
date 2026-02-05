import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import homeMascot from "@/assets/mascot/Won.png";
import specialtiesData from "@/data/specialties.json";
import questionsData from "@/data/questions.json";
import { ROUTES } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { useQuizStore, type AnswerValue } from "@/store/quizStore";
import { ANSWER_TO_SCORE, getRanking } from "@/core/scoring/scoring";
import type { QuizQuestion, Specialty } from "@/shared/types";

function answerLabel(a: AnswerValue) {
  switch (a) {
    case "yes":
      return "Так";
    case "rather_yes":
      return "Скоріше так";
    case "idk":
      return "Не знаю";
    case "rather_no":
      return "Скоріше ні";
    case "no":
      return "Ні";
  }
}

export function ResultWinPage() {
  const navigate = useNavigate();
  const contentH = "h-[calc(100dvh-3.5rem-3rem)]";

  const reset = useQuizStore((s) => s.reset);
  const scores = useQuizStore((s) => s.scores);
  const answeredIds = useQuizStore((s) => s.answeredIds);
  const answersByQuestionId = useQuizStore((s) => s.answersByQuestionId);

  const specialties = useMemo<Specialty[]>(() => {
    const arr = (specialtiesData as Specialty[]).slice();
    arr.sort((a, b) => a.id.localeCompare(b.id));
    return arr;
  }, []);

  const questions = useMemo<QuizQuestion[]>(() => {
    const arr = (questionsData as QuizQuestion[]).slice();
    arr.sort((a, b) => a.id - b.id);
    return arr;
  }, []);

  const data = useMemo(() => {
    const ranking = getRanking(scores);
    const topId = ranking[0];

    const top = specialties.find((s) => s.id === topId) ?? specialties[0];

    const influences = answeredIds
      .map((qid) => {
        const q = questions.find((x) => x.id === qid);
        const a = answersByQuestionId[qid];
        if (!q || !a) return null;

        const contrib = (ANSWER_TO_SCORE[a] ?? 0) * (q.weights[topId] ?? 0);

        return {
          id: q.id,
          textUk: q.textUk,
          answerLabel: answerLabel(a),
          abs: Math.abs(contrib),
        };
      })
      .filter(Boolean) as Array<{
      id: number;
      textUk: string;
      answerLabel: string;
      abs: number;
    }>;

    influences.sort((a, b) => b.abs - a.abs);

    return { top, topQuestions: influences.slice(0, 3) };
  }, [scores, specialties, questions, answeredIds, answersByQuestionId]);

  const quizOrderByQuestionId = useMemo(() => {
    const map = new Map<number, number>();
    for (let i = 0; i < answeredIds.length; i++) {
      map.set(answeredIds[i], i + 1);
    }
    return map;
  }, [answeredIds]);

  return (
    <section className={["relative", contentH, "overflow-hidden"].join(" ")}>
      <style>{`
        @keyframes itnCardIn {
          0%   { opacity: 0; transform: translate3d(0, 10px, 0) scale(0.985); filter: saturate(0.98) contrast(0.98); }
          65%  { opacity: 1; transform: translate3d(0, 0, 0) scale(1.0); filter: saturate(1.02) contrast(1.01); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1.0); filter: saturate(1) contrast(1); }
        }

        @keyframes itnCardGloss {
          0%   { transform: translateX(-120%) skewX(-16deg); opacity: 0; }
          20%  { opacity: 0.32; }
          60%  { opacity: 0.32; }
          100% { transform: translateX(120%) skewX(-16deg); opacity: 0; }
        }

        .itn-card-in {
          opacity: 0;
          transform: translate3d(0, 10px, 0) scale(0.985);
          animation: itnCardIn 700ms cubic-bezier(0.16, 1, 0.3, 1) 80ms forwards;
          will-change: transform, opacity, filter;
        }

        .itn-card-in::after {
          content: "";
          position: absolute;
          inset: -2px;
          pointer-events: none;
          z-index: 0;

          background: linear-gradient(
            110deg,
            transparent 0%,
            rgba(255,255,255,0.00) 34%,
            rgba(255,255,255,0.18) 45%,
            rgba(255,255,255,0.45) 50%,
            rgba(255,255,255,0.18) 55%,
            rgba(255,255,255,0.00) 66%,
            transparent 100%
          );

          opacity: 0;
          animation: itnCardGloss 900ms cubic-bezier(0.2, 0.9, 0.2, 1) 260ms forwards;
        }

        @keyframes itnFadeUp {
          from { opacity: 0; transform: translate3d(0, 8px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        .itn-stagger {
          opacity: 0;
          transform: translate3d(0, 8px, 0);
          animation: itnFadeUp 520ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .itn-card-in {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
            filter: none !important;
          }
          .itn-card-in::after { display: none !important; }

          .itn-stagger {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div
        className={[
          "mx-auto flex h-full",
          "max-w-[1280px] px-6 md:px-10 py-6",
        ].join(" ")}
      >
        <div className="relative z-10 h-full w-full max-w-[760px]">
          <div
            className={[
              "relative h-full overflow-hidden rounded-[28px]",
              "border border-white/30 bg-white/22 backdrop-blur-3xl",
              "shadow-[0_50px_140px_-70px_rgba(0,0,0,0.55)]",
              "transition duration-300 ease-out",
              "hover:-translate-y-1 hover:border-white/45",
              "hover:shadow-[0_70px_160px_-90px_rgba(0,0,0,0.75)]",
              "itn-card-in",
            ].join(" ")}
          >
            <div
              className={[
                "pointer-events-none absolute inset-0",
                "opacity-0 transition-opacity duration-300",
                "hover:opacity-100",
                "bg-[radial-gradient(900px_360px_at_25%_16%,rgba(255,255,255,0.60),transparent_60%)]",
              ].join(" ")}
              aria-hidden="true"
            />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_8%,rgba(255,255,255,0.80)_0%,rgba(255,255,255,0.22)_40%,rgba(255,255,255,0)_70%)]" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-violet-500/16 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col p-7 md:p-8">
              <div>
                <div
                  className="itn-stagger inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/18 px-4 py-2 text-sm font-semibold text-slate-900/80"
                  style={{ animationDelay: "170ms" }}
                >
                  ✅ Айтінатор вгадав
                </div>

                <h1
                  className="itn-stagger mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-[40px] md:leading-tight"
                  style={{ animationDelay: "230ms" }}
                >
                  Вітаю! Тобі найбільше підходить:
                </h1>

                <div
                  className={[
                    "itn-stagger mt-5",
                    "relative overflow-hidden rounded-2xl",
                    "border border-white/30 bg-white/18 p-6 backdrop-blur-2xl",
                    "transform-gpu will-change-transform",
                    "transition-[transform,background-color,border-color,box-shadow] duration-250 ease-out",
                    "hover:-translate-y-[1px]",
                    "hover:bg-white/22 hover:border-white/45",
                    "hover:shadow-[0_18px_44px_rgba(0,0,0,0.10)]",
                    "focus-within:-translate-y-[1px]",
                    "focus-within:bg-white/22 focus-within:border-white/45",
                    "focus-within:shadow-[0_18px_44px_rgba(0,0,0,0.10)]",
                  ].join(" ")}
                  style={{ animationDelay: "290ms" }}
                >
                  <div
                    className={[
                      "pointer-events-none absolute inset-0 opacity-0",
                      "transition-opacity duration-250",
                      "hover:opacity-100",
                      "bg-[radial-gradient(120%_90%_at_14%_20%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.06)_42%,rgba(255,255,255,0)_72%)]",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-white/0 transition duration-250 hover:ring-white/14" />

                  <div className="relative">
                    <div className="text-2xl font-semibold text-slate-900">
                      {data.top?.nameUk ?? "—"}
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-slate-700/85">
                      {data.top?.shortUk ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div
                    className="itn-stagger text-sm font-semibold text-slate-900/80"
                    style={{ animationDelay: "350ms" }}
                  >
                    Питання, які найбільше вплинули на результат
                  </div>

                  <div
                    className="itn-stagger mt-3 overflow-hidden rounded-2xl border border-white/30 bg-white/18 backdrop-blur-2xl"
                    style={{ animationDelay: "410ms" }}
                  >
                    {data.topQuestions.map((q, idx) => (
                      <div key={q.id}>
                        <div
                          className={[
                            "group relative px-6 py-3",
                            "transform-gpu will-change-transform",
                            "transition-[transform,background-color,box-shadow] duration-220 ease-out",
                            "hover:-translate-y-[1px]",
                            "hover:bg-white/16",
                            "hover:shadow-[0_14px_34px_rgba(0,0,0,0.08)]",
                          ].join(" ")}
                        >
                          <div className="text-xs font-semibold text-slate-700/60">
                            Питання #{quizOrderByQuestionId.get(q.id) ?? "—"}
                          </div>
                          <div className="mt-1 text-[15px] font-semibold text-slate-900/90">
                            {q.textUk}
                          </div>
                          <div className="mt-2 text-xs font-semibold text-slate-700/60">
                            Твоя відповідь:{" "}
                            <span className="text-slate-900/80">
                              {q.answerLabel}
                            </span>
                          </div>

                          <span
                            className={[
                              "pointer-events-none absolute inset-0 opacity-0",
                              "transition-opacity duration-200",
                              "group-hover:opacity-100",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            <span className="absolute inset-0 bg-[radial-gradient(120%_90%_at_14%_20%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.05)_42%,rgba(255,255,255,0)_72%)]" />
                            <span className="absolute inset-0 ring-1 ring-white/12" />
                          </span>
                        </div>

                        {idx !== data.topQuestions.length - 1 ? (
                          <div className="h-px bg-linear-to-r from-transparent via-slate-900/10 to-transparent" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1" />

              <div className="itn-stagger" style={{ animationDelay: "700ms" }}>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    size="lg"
                    className="group relative h-12 min-w-[240px] rounded-2xl bg-blue-600 px-8 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-600/90"
                    onClick={() => {
                      reset();
                      navigate(ROUTES.quiz);
                    }}
                  >
                    <span className="relative z-10 text-base font-semibold">
                      Спробувати ще раз
                    </span>
                    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                      <span className="absolute -left-24 top-0 h-full w-40 rotate-12 bg-white/25 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </span>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="h-12 rounded-2xl border border-white/25 bg-white/20 shadow-sm backdrop-blur-xl hover:bg-white/32 hover:border-white/45"
                  >
                    <Link to={ROUTES.home}>На головну</Link>
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
            src={homeMascot}
            alt="Айтінатор"
            className="itn-mascot h-[74dvh] max-h-[780px] w-auto select-none object-contain md:h-[88dvh] md:max-h-[860px] lg:h-[96dvh] lg:max-h-[920px]"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
