import { NavLink, useNavigate } from "react-router-dom";
import NotificationCenter from "./NotificationCenter";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: "🏠",
    path: "/dashboard",
  },
  {
    label: "Subscriptions",
    icon: "💳",
    path: "/subscriptions",
  },
  {
    label: "Free Trials",
    icon: "🎁",
    path: "/free-trials",
  },
  {
    label: "Analytics",
    icon: "📊",
    path: "/analytics",
  },
  {
    label: "AI Parser",
    icon: "🤖",
    path: "/ai-parser",
  },
  {
    label: "Settings",
    icon: "⚙️",
    path: "/settings",
  },
];

function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  function handleLogout() {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("token");

    console.log("Logout successful");

    navigate("/");

    onClose?.();
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={
          "fixed lg:static inset-y-0 left-0 z-50 w-64 shrink-0 " +
          "bg-slate-900 border-r border-slate-800 " +
          "flex flex-col transition-transform duration-200 " +
          "lg:translate-x-0 " +
          (open
            ? "translate-x-0"
            : "-translate-x-full")
        }
      >

        {/* LOGO */}

        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-800">

          <span className="text-xl">
            🛡️
          </span>

          <div className="min-w-0">
            <p className="font-semibold text-white truncate">
              Subscription Guardian
            </p>

            <p className="text-xs text-slate-500">
              AI Subscription Manager
            </p>
          </div>

        </div>


        {/* NOTIFICATION */}

        <div className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Alerts
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Upcoming renewals
            </p>
          </div>

          <NotificationCenter />

        </div>


        {/* NAVIGATION */}

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">

          <p className="px-3.5 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
            Main Menu
          </p>

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                "group relative flex items-center gap-3 " +
                "px-3.5 py-2.5 rounded-xl text-sm " +
                "font-medium transition-all duration-200 " +
                (
                  isActive
                    ? "bg-indigo-500/10 text-indigo-300 " +
                      "border border-indigo-500/20"
                    : "text-slate-400 " +
                      "hover:text-slate-100 " +
                      "hover:bg-slate-800/60 " +
                      "border border-transparent"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-400 rounded-r-full" />
                  )}

                  <span
                    className={
                      "text-base transition-transform duration-200 " +
                      "group-hover:scale-110"
                    }
                  >
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="ml-auto text-indigo-400">
                      •
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

        </nav>


        {/* LOGOUT */}

        <div className="p-3 border-t border-slate-800">

          <div className="px-3.5 pb-2">
            <p className="text-xs text-slate-600">
              Account
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
          >
            <span className="text-base">
              🚪
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;