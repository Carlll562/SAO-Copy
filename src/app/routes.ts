import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Students } from "./pages/Students";
import { GradeEntry } from "./pages/GradeEntry";
import { AuditLogs } from "./pages/AuditLogs";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "students", Component: Students },
      { path: "grade-entry", Component: GradeEntry },
      { path: "audit", Component: AuditLogs },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);