import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

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

  const token =
    localStorage.getItem("token");

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
    <div className="min-h-screen bg-slate-950">

      <Sidebar />

      <main className="ml-64 min-h-screen">

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