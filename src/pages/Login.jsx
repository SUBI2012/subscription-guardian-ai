import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      console.log("Login response:", response.data);

      setMessage("Login successful! 🎉");

      const requestedPath = location.state?.from;

      const destination =
        requestedPath && requestedPath !== "/"
          ? requestedPath
          : "/dashboard";

      setTimeout(() => {
        navigate(destination, {
          replace: true,
        });
      }, 800);
    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(
          error.response.data.detail ||
            "Invalid email or password"
        );
      } else {
        setMessage(
          "Cannot connect to the backend."
        );
      }

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">

          <div className="text-4xl mb-3">
            🛡️
          </div>

          <h1 className="text-3xl font-bold text-white">
            Subscription Guardian
          </h1>

          <p className="text-slate-400 mt-2">
            Never miss a subscription renewal again.
          </p>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <h2 className="text-xl font-semibold text-white mb-6">
            Welcome back
          </h2>

          <form onSubmit={handleLogin}>

            <label className="text-sm text-slate-300">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full mt-2 mb-5 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
              required
            />

            <label className="text-sm text-slate-300">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full mt-2 mb-6 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          {message && (
            <p
              className={`text-center text-sm mt-5 ${
                message.includes("successful")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          <p className="text-center text-sm text-slate-400 mt-6">

            Don't have an account?

            <Link
              to="/register"
              className="text-indigo-400 ml-1 hover:text-indigo-300"
            >
              Create account
            </Link>

          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;