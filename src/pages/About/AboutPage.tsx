import { useMemo, useState } from "react";

import aboutMascot from "@/assets/mascot/About.png";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={[
        "shrink-0",
        "transition-transform duration-300 ease-out",
        open ? "rotate-180 scale-[1.04]" : "rotate-0 scale-100",
      ].join(" ")}
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AboutPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo<FaqItem[]>(
    () => [
      {
        id: "q1",
        question: "Що таке Айтінатор?",
        answer:
          "Айтінатор — це інтерактивний сервіс, який допомагає приблизно визначити IT-напрям, що найкраще підходить саме тобі. Ти відповідаєш на серію коротких запитань, а система поступово звужує варіанти та показує найімовірнішу спеціальність.",
      },
      {
        id: "q2",
        question: "Як працює алгоритм?",
        answer:
          "Кожна відповідь додає або віднімає бали різним IT-напрямам. Після кожного запитання ми перераховуємо рейтинг і підбираємо наступне питання так, щоб воно найкраще розрізняло лідерів. Це поступове уточнення профілю за твоїми уподобаннями.",
      },
      {
        id: "q3",
        question: "Це тест чи просто гра?",
        answer:
          "Це гра у форматі «вгадаю за N запитань», але з корисним сенсом. Айтінатор не ставить діагноз і не замінює профорієнтацію — він дає підказку, куди копати далі: які ролі почитати, які навички спробувати, які навчальні матеріали можуть зайти.",
      },
      {
        id: "q4",
        question: "Наскільки точний результат?",
        answer:
          "Точність залежить від щирості відповідей і від того, наскільки близькі між собою напрямки (деякі ролі реально перетинаються). Тому результат краще сприймати як «топ-1 + близькі альтернативи». Якщо сумніваєшся — пройди ще раз і відповідай максимально чесно 🙂",
      },
      {
        id: "q5",
        question: "Чи зберігаються мої відповіді та дані?",
        answer:
          "Ні, за замовчуванням ми не збираємо персональні дані й не прив’язуємо відповіді до твоєї особи. Відповіді потрібні тільки для обчислення результату під час проходження. (Якщо пізніше додамо статистику — це буде окремо й прозоро.)",
      },
    ],
    [],
  );

  const contentH = "h-[calc(100dvh-3.5rem-3rem)]";

  return (
    <section className={["relative", contentH, "overflow-hidden"].join(" ")}>
      <div
        className={[
          "mx-auto flex",
          contentH,
          "max-w-[1280px] px-6 md:px-10",
        ].join(" ")}
      >
        <div className="relative z-10 w-full max-w-[760px]">
          <div className="flex h-full flex-col justify-center">
            <h1 className="itn-reveal text-5xl font-semibold tracking-tight text-slate-900">
              Про проєкт
            </h1>

            <div className="mt-8 itn-reveal itn-reveal-delay-1">
              <div
                className={[
                  "relative overflow-hidden rounded-[28px]",
                  "border border-white/30 bg-white/22 backdrop-blur-3xl",
                  "p-10 shadow-[0_50px_140px_-70px_rgba(0,0,0,0.55)]",
                  "transition duration-300 ease-out",
                  "hover:-translate-y-1 hover:border-white/45",
                  "hover:shadow-[0_70px_160px_-90px_rgba(0,0,0,0.75)]",
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

                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_8%,rgba(255,255,255,0.80)_0%,rgba(255,255,255,0.22)_40%,rgba(255,255,255,0)_70%)]"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/18 blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-violet-500/16 blur-3xl"
                  aria-hidden="true"
                />

                <div className="relative">
                  <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/18 backdrop-blur-2xl">
                    {items.map((it, idx) => {
                      const isOpen = openId === it.id;

                      return (
                        <div key={it.id}>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenId((prev) =>
                                prev === it.id ? null : it.id,
                              )
                            }
                            className={[
                              "flex w-full items-center justify-between gap-4 px-6 py-4 text-left",
                              "transition-[background-color,box-shadow] duration-250",
                              "hover:bg-white/18",
                              isOpen
                                ? "bg-white/22 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset]"
                                : "",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                            ].join(" ")}
                            aria-expanded={isOpen}
                          >
                            <span className="text-base font-semibold text-slate-900">
                              {it.question}
                            </span>

                            <span
                              className={[
                                "text-slate-700/70 transition-colors duration-200",
                                isOpen ? "text-slate-900/70" : "",
                              ].join(" ")}
                            >
                              <Chevron open={isOpen} />
                            </span>
                          </button>

                          <div
                            className={[
                              "grid transition-[grid-template-rows,opacity] duration-250 ease-out",
                              isOpen
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0",
                            ].join(" ")}
                          >
                            <div className="overflow-hidden">
                              <div className="px-6 pb-5 text-[15px] leading-relaxed text-slate-700/85">
                                {it.answer}
                              </div>
                            </div>
                          </div>

                          {idx !== items.length - 1 ? (
                            <div className="h-px bg-linear-to-r from-transparent via-slate-900/10 to-transparent" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden flex-1 md:block" />
      </div>

      <div className="pointer-events-none absolute right-2 top-1/2 z-0 -translate-y-1/2 md:right-6 lg:right-20">
        <div
          className="absolute -inset-24 -z-10 rounded-full bg-[radial-gradient(circle_at_55%_40%,rgba(56,189,248,0.35)_0%,rgba(99,102,241,0.18)_45%,rgba(168,85,247,0.12)_70%,rgba(255,255,255,0)_100%)] blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -inset-28 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.07)_35%,rgba(255,255,255,0)_72%)] blur-2xl"
          aria-hidden="true"
        />

        <div className="itn-mascot-wrap">
          <img
            src={aboutMascot}
            alt="Про проєкт"
            className="itn-mascot h-[74dvh] max-h-[780px] w-auto select-none object-contain md:h-[88dvh] md:max-h-[860px] lg:h-[96dvh] lg:max-h-[920px]"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
