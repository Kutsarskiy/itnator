export const ROUTES = {
  home: "/",
  quiz: "/quiz",

  resultLose: "/result/lose",
  resultWinIntro: "/result/win/intro",
  resultWin: "/result/win",

  result: "/result",

  about: "/about",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
