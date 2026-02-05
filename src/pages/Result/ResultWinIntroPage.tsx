import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import homeMascot from "@/assets/mascot/Intro.png";
import { ROUTES } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/store/quizStore";

export function ResultWinIntroPage() {
  const navigate = useNavigate();
  const contentH = "h-[calc(100dvh-3.5rem-3rem)]";

  const outcome = useQuizStore((s) => s.outcome);

  useEffect(() => {
    if (outcome === "win") return;
    if (outcome === "lose") {
      navigate(ROUTES.resultLose, { replace: true });
      return;
    }
    navigate(ROUTES.quiz, { replace: true });
  }, [outcome, navigate]);

  return (
    <section className={["relative", contentH, "overflow-hidden"].join(" ")}>
      <style>{`
        @keyframes itnProgressFill {
          from { transform: scaleX(0); opacity: 0.65; }
          to   { transform: scaleX(1); opacity: 1; }
        }

        @keyframes itnProgressShimmer {
          0%   { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          12%  { opacity: 0.75; }
          55%  { opacity: 0.75; }
          100% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
        }

        .itn-progress-fill {
          position: relative;
          transform-origin: left;
          transform: scaleX(0);
          animation: itnProgressFill 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          background: linear-gradient(90deg,
            rgba(16,185,129,0.92) 0%,
            rgba(34,197,94,0.92) 45%,
            rgba(132,204,22,0.85) 100%
          );
          box-shadow:
            0 8px 24px rgba(16,185,129,0.25),
            0 0 0 1px rgba(255,255,255,0.16) inset;
        }

        .itn-progress-fill::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 42%;
          pointer-events: none;
          border-radius: 9999px;

          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.25) 25%,
            rgba(255,255,255,0.55) 50%,
            rgba(255,255,255,0.25) 75%,
            rgba(255,255,255,0) 100%
          );
          filter: blur(0.3px);

          opacity: 0;
          animation: itnProgressShimmer 750ms cubic-bezier(0.2, 0.9, 0.2, 1) 900ms forwards;
        }

        @keyframes itnCardIn {
          0%   { opacity: 0; transform: translate3d(0, 10px, 0) scale(0.985); filter: saturate(0.98) contrast(0.98); }
          65%  { opacity: 1; transform: translate3d(0, 0, 0) scale(1.0); filter: saturate(1.02) contrast(1.01); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1.0); filter: saturate(1) contrast(1); }
        }

        @keyframes itnCardGloss {
          0%   { transform: translateX(-120%) skewX(-16deg); opacity: 0; }
          20%  { opacity: 0.35; }
          60%  { opacity: 0.35; }
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

          .itn-progress-fill {
            transform: scaleX(1);
            animation: none;
          }
          .itn-progress-fill::after {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>

      <div
        className={[
          "mx-auto flex h-full items-center",
          "max-w-[1280px] px-6 md:px-10 py-6",
        ].join(" ")}
      >
        <div className="relative z-10 w-full max-w-[760px]">
          <div className="relative itn-card-in overflow-hidden rounded-[28px] border border-white/30 bg-white/22 shadow-[0_50px_140px_-70px_rgba(0,0,0,0.55)] backdrop-blur-3xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_8%,rgba(255,255,255,0.80)_0%,rgba(255,255,255,0.22)_40%,rgba(255,255,255,0)_70%)]" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-violet-500/16 blur-3xl" />

            <div className="relative z-10 p-7 md:p-8">
              <div
                className="itn-stagger flex flex-wrap items-center gap-2"
                style={{ animationDelay: "170ms" }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/18 px-4 py-2 text-sm font-semibold text-slate-900/80">
                  🧠 Айтінатор визначився
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/14 px-4 py-2 text-sm font-semibold text-slate-900/70">
                  ✅ Фінальний прогноз готовий
                </div>
              </div>

              <h1
                className="itn-stagger mt-5 text-[30px] font-semibold tracking-tight text-slate-900 md:text-[38px] md:leading-tight"
                style={{ animationDelay: "230ms" }}
              >
                Готово. Я вже знаю, яка спеціальність тобі підходить найбільше
                👀
              </h1>

              <p
                className="itn-stagger mt-3 max-w-[56ch] text-[15px] leading-relaxed text-slate-700/85"
                style={{ animationDelay: "290ms" }}
              >
                У твоїх відповідях є чіткий лідер — і він реально логічний.
                Натисни кнопку нижче, і я відкрию результат.
              </p>

              <div
                className="itn-stagger mt-6 overflow-hidden rounded-2xl border border-white/30 bg-white/16 backdrop-blur-2xl"
                style={{ animationDelay: "350ms" }}
              >
                <div className="px-6 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-700/60">
                        Фінальний лідер
                      </div>
                      <div className="mt-1 text-[16px] font-semibold text-slate-900/90">
                        Спеціальність уже обрана ✨
                      </div>
                      <div className="mt-2 text-[13px] leading-relaxed text-slate-700/75">
                        Я покажу результат одразу після кліку.
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/25 bg-white/14 px-4 py-3 text-center">
                      <div className="text-xs font-semibold text-slate-700/60">
                        Готовність
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900/85">
                        100%
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-4 h-2 overflow-hidden rounded-full bg-white/20"
                    role="progressbar"
                    aria-valuenow={100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Готовність результату"
                  >
                    <div className="itn-progress-fill h-full w-full rounded-full" />
                  </div>
                </div>
              </div>

              <div
                className="itn-stagger mt-7 flex flex-col items-center justify-center gap-3"
                style={{ animationDelay: "420ms" }}
              >
                <Button
                  size="lg"
                  className="group relative h-12 min-w-[300px] rounded-2xl bg-blue-600 px-10 text-white shadow-xl shadow-blue-600/25 hover:bg-blue-600/90"
                  onClick={() => navigate(ROUTES.resultWin)}
                >
                  <span className="relative z-10 text-base font-semibold">
                    Показати мій результат
                  </span>

                  <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    <span className="absolute -left-28 top-0 h-full w-44 rotate-12 bg-white/25 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </span>
                </Button>

                <div className="text-center text-xs text-slate-700/65">
                  Натискай — покажу, що вийшло 🔥
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
