import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { AppLayout } from "@/app/layout";
import { HomePage } from "@/pages/Home";
import { QuizPage } from "@/pages/Quiz";
import {
  ResultLosePage,
  ResultWinIntroPage,
  ResultWinPage,
} from "@/pages/Result";
import { AboutPage } from "@/pages/About";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.quiz, element: <QuizPage /> },

      { path: ROUTES.resultLose, element: <ResultLosePage /> },
      { path: ROUTES.resultWinIntro, element: <ResultWinIntroPage /> },
      { path: ROUTES.resultWin, element: <ResultWinPage /> },

      {
        path: ROUTES.result,
        element: <Navigate to={ROUTES.resultLose} replace />,
      },

      { path: ROUTES.about, element: <AboutPage /> },
      { path: "*", element: <Navigate to={ROUTES.home} replace /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
