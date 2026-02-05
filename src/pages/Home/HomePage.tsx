import { Link } from "react-router-dom";

import homeMascot from "@/assets/mascot/Home.png";
import { ROUTES } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/store/quizStore";

export function HomePage() {
  const outcome = useQuizStore((s) => s.outcome);
  const reset = useQuizStore((s) => s.reset);

  return (
    <section className="relative min-h-[calc(100dvh-3.5rem-3rem)] overflow-hidden">
      <style>{`
        @keyframes itnEnterUp {
          from { opacity: 0; transform: translateY(10px); filter: blur(0.6px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0px); }
        }

        @keyframes itnPillPop {
          0%   { opacity: 0; transform: translateY(6px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes itnBtnIntroShimmer {
          0%   { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          12%  { opacity: 0.75; }
          55%  { opacity: 0.75; }
          100% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
        }

        .itn-btn-shimmer {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          overflow: hidden;
          pointer-events: none;
        }

        .itn-btn-shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 46%;
          border-radius: 9999px;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.20) 25%,
            rgba(255,255,255,0.55) 50%,
            rgba(255,255,255,0.20) 75%,
            rgba(255,255,255,0) 100%
          );
          opacity: 0;
          transform: translateX(-140%) skewX(-18deg);
          filter: blur(0.3px);
        }

        .group:hover .itn-btn-shimmer::after {
          opacity: 1;
          animation: itnBtnIntroShimmer 700ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }

        .itn-btn-intro .itn-btn-shimmer::after {
          opacity: 1;
          animation: itnBtnIntroShimmer 720ms cubic-bezier(0.2, 0.9, 0.2, 1) 520ms forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .itn-anim-enter, .itn-anim-pill { animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important; }
          .itn-btn-shimmer::after { animation: none !important; opacity: 0 !important; }
        }
      `}</style>

      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem-3rem)] max-w-[1280px] items-center px-6 md:px-10">
        <div className="relative z-10 w-full max-w-[560px]">
          <div
            className={[
              "relative overflow-hidden rounded-[28px] border border-white/30 bg-white/22 p-10",
              "shadow-[0_50px_140px_-70px_rgba(0,0,0,0.55)] backdrop-blur-3xl",
              "transition-transform duration-300 ease-out",
              "hover:-translate-y-1 hover:border-white/40",
              "hover:shadow-[0_60px_160px_-70px_rgba(0,0,0,0.62)]",
            ].join(" ")}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_8%,rgba(255,255,255,0.80)_0%,rgba(255,255,255,0.22)_40%,rgba(255,255,255,0)_70%)]" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-violet-500/16 blur-3xl" />

            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100" />
            <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/0 transition duration-300 hover:ring-white/12" />

            <div className="relative">
              <h1
                className="itn-anim-enter text-5xl font-semibold tracking-tight text-slate-900"
                style={{
                  animation:
                    "itnEnterUp 520ms cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                Айтінатор
              </h1>

              <p
                className="itn-anim-enter mt-6 text-lg leading-relaxed text-slate-700/80"
                style={{
                  animation:
                    "itnEnterUp 560ms cubic-bezier(0.16, 1, 0.3, 1) 90ms both",
                }}
              >
                Я спробую вгадати, яка IT-спеціальність тобі підходить —{" "}
                <span className="font-semibold text-slate-900">
                  максимум за 15 запитань
                </span>
                .
              </p>

              <div
                className="itn-anim-enter mt-10 flex items-center gap-3"
                style={{
                  animation:
                    "itnEnterUp 600ms cubic-bezier(0.16, 1, 0.3, 1) 160ms both",
                }}
              >
                <Button
                  asChild
                  size="lg"
                  className={[
                    "group itn-btn-intro relative h-12 rounded-2xl bg-blue-600 px-8 text-white",
                    "shadow-xl shadow-blue-600/25 hover:bg-blue-600/90",
                    "transition-transform duration-200 ease-out",
                    "hover:-translate-y-[1px] hover:shadow-2xl hover:shadow-blue-600/30",
                    "active:translate-y-0",
                    "focus-visible:outline-none",
                  ].join(" ")}
                >
                  <Link
                    to={ROUTES.quiz}
                    className={[
                      "relative z-10 inline-flex items-center justify-center",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                      "rounded-2xl",
                    ].join(" ")}
                    onClick={() => {
                      if (outcome !== "in_progress") reset();
                    }}
                  >
                    <span className="text-base font-semibold">
                      Почати опитування
                    </span>

                    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                      <span className="absolute -left-24 top-0 h-full w-40 rotate-12 bg-white/18 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </span>

                    <span className="itn-btn-shimmer" aria-hidden="true" />
                  </Link>
                </Button>

                <div
                  className="itn-anim-pill hidden items-center gap-2 rounded-full border border-white/30 bg-white/14 px-4 py-2 text-sm font-medium text-slate-600/75 md:inline-flex"
                  style={{
                    animation:
                      "itnPillPop 520ms cubic-bezier(0.16, 1, 0.3, 1) 420ms both",
                  }}
                >
                  <span className="text-slate-700/70">⚡</span>
                  <span>15 запитань • 2 хвилини</span>
                </div>
              </div>

              <div
                className="itn-anim-enter mt-4 text-sm text-slate-600/70 md:hidden"
                style={{
                  animation:
                    "itnEnterUp 520ms cubic-bezier(0.16, 1, 0.3, 1) 300ms both",
                }}
              >
                15 запитань • 2 хвилини
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
