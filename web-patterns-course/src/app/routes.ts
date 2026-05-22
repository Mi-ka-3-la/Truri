import { createBrowserRouter } from "react-router";
import { Root } from "@/app/components/Root";
import { CourseOverview } from "@/app/components/pages/CourseOverview";
import { BalanceSheet } from "@/app/components/pages/BalanceSheet";
import { IncomeStatement } from "@/app/components/pages/IncomeStatement";
import { NotFound } from "@/app/components/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: CourseOverview },
      { path: "learn", Component: BalanceSheet },
      { path: "income-statement", Component: IncomeStatement },
      { path: "*", Component: NotFound },
    ],
  },
]);
