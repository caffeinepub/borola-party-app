import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import AdminPage from "./pages/AdminPage";
import CandidatesPage from "./pages/CandidatesPage";
import HomePage from "./pages/HomePage";
import JoinPage from "./pages/JoinPage";
import MlasPage from "./pages/MlasPage";
import SupportersPage from "./pages/SupportersPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

const mlasRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/mlas",
  component: MlasPage,
});

const candidatesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/candidates",
  component: CandidatesPage,
});

const joinRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/join",
  component: JoinPage,
});

const supportersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/supporters",
  component: SupportersPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

export const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    mlasRoute,
    candidatesRoute,
    joinRoute,
    supportersRoute,
  ]),
  adminRoute,
]);
