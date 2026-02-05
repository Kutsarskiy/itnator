import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/store/quizStore";

export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const resetQuiz = useQuizStore((s) => s.reset);

  const isQuiz = pathname === ROUTES.quiz;

  const isResult =
    pathname === ROUTES.result || pathname.startsWith(`${ROUTES.result}/`);

  const isFullBleed =
    pathname === ROUTES.home ||
    pathname === ROUTES.about ||
    pathname === ROUTES.quiz ||
    isResult;

  return (
    <div className="relative flex min-h-dvh flex-col text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950" />

        <div className="absolute -left-64 -top-64 h-[900px] w-[900px] rounded-full bg-blue-500/30 blur-3xl itn-blob-a" />
        <div className="absolute -right-64 -top-48 h-[900px] w-[900px] rounded-full bg-violet-500/28 blur-3xl itn-blob-b" />
        <div className="absolute -left-64 -bottom-64 h-[900px] w-[900px] rounded-full bg-cyan-400/22 blur-3xl itn-blob-c" />

        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04]" />
      </div>

      <header className="itn-shimmer relative z-10 h-14 border-b border-white/20 bg-white/55 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6 md:px-10">
          <Link
            to={ROUTES.home}
            className="group inline-flex items-center gap-3"
            aria-label="Айтінатор"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-white/30 text-[12px] font-extrabold text-slate-900/75 shadow-sm">
              IT
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-slate-900/80">
              Айтінатор
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isQuiz ? (
              <Button
                variant="secondary"
                className="h-9 rounded-full border border-white/25 bg-white/20 px-4 text-sm font-semibold text-slate-900/80 shadow-sm backdrop-blur-xl hover:bg-white/32 hover:border-white/45"
                onClick={() => {
                  resetQuiz();
                  navigate(ROUTES.home);
                }}
              >
                Вийти з тесту
              </Button>
            ) : (
              <Button
                asChild
                variant="secondary"
                className="h-9 rounded-full border border-white/25 bg-white/20 px-4 text-sm font-semibold text-slate-900/80 shadow-sm backdrop-blur-xl hover:bg-white/32 hover:border-white/45"
              >
                <Link to={ROUTES.about}>Про проект</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main
        className={[
          "relative z-10",
          isFullBleed
            ? "flex-1"
            : "mx-auto w-full max-w-[1280px] flex-1 px-6 md:px-10",
        ].join(" ")}
      >
        <Outlet />
      </main>

      <footer className="itn-shimmer relative z-10 h-12 border-t border-white/20 bg-white/55 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6 text-xs text-slate-900/55 md:px-10">
          <span>© Айтінатор</span>
          <span className="hidden sm:inline">
            Знайдемо твою IT-спеціальність за 2 хвилини
          </span>
        </div>
      </footer>
    </div>
  );
}
