import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useState } from "react";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Subscriptions from "./pages/Subscriptions";
import AddSubscription from "./pages/AddSubscription";
import FreeTrials from "./pages/FreeTrials";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import AIParser from "./pages/AIParser";

function ProtectedLayout() {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950">

      {/* SIDEBAR */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MOBILE HEADER */}
      <header className="lg:hidden sticky top-0 z-30 h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4">

        <div className="flex items-center gap-2 min-w-0">

          <span className="text-xl">
            🛡️
          </span>

          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">
              Subscription Guardian
            </p>

            <p className="text-[10px] text-slate-500 truncate">
              AI Subscription Manager
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            setSidebarOpen(true)
          }
          className="w-10 h-10 shrink-0 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center hover:bg-slate-700 transition"
          aria-label="Open menu"
        >
          ☰
        </button>

      </header>

      {/* MAIN CONTENT */}
      <main className="min-h-screen w-full lg:ml-64 lg:w-[calc(100%-16rem)]">

        <Routes>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/subscriptions"
            element={<Subscriptions />}
          />

          <Route
            path="/add-subscription"
            element={<AddSubscription />}
          />

          <Route
            path="/free-trials"
            element={<FreeTrials />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/ai-parser"
            element={<AIParser />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>

      </main>

    </div>
  );
}

function App() {
  const location = useLocation();

  if (location.pathname === "/") {
    return <Login />;
  }

  if (location.pathname === "/register") {
    return <Register />;
  }

  return <ProtectedLayout />;
}

function RootApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default RootApp;