import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    // Password validation
    if (password.length < 8) {
      setMessage(
        "Password must contain at least 8 characters."
      );
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        name: name,
        email: email,
        password: password,
      });

      setMessage(
        "Account created successfully! 🎉"
      );

      // Go to login after successful registration
      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      if (error.response) {
        setMessage(
          error.response.data.detail ||
            "Registration failed."
        );
      } else {
        setMessage(
          "Cannot connect to the backend."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* BRAND */}

        <div className="text-center mb-8">

          <div className="text-4xl mb-3">
            🛡️
          </div>

          <h1 className="text-3xl font-bold text-white">
            Subscription Guardian
          </h1>

          <p className="text-slate-400 mt-2">
            Create your account and start
            managing subscriptions.
          </p>

        </div>

        {/* REGISTER CARD */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <h2 className="text-xl font-semibold text-white mb-6">
            Create account
          </h2>

          <form onSubmit={handleRegister}>

            {/* NAME */}

            <label className="text-sm text-slate-300">
              Name
            </label>

            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full mt-2 mb-5 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
              required
            />

            {/* EMAIL */}

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

            {/* PASSWORD */}

            <label className="text-sm text-slate-300">
              Password
            </label>

            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full mt-2 mb-5 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
              required
            />

            {/* CONFIRM PASSWORD */}

            <label className="text-sm text-slate-300">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              className="w-full mt-2 mb-6 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
              required
            />

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>

          {/* MESSAGE */}

          {message && (
            <p
              className={`text-center text-sm mt-5 ${
                message.includes(
                  "successfully"
                )
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          {/* BACK TO LOGIN */}

          <p className="text-center text-sm text-slate-400 mt-6">

            Already have an account?

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="text-indigo-400 ml-1 hover:text-indigo-300"
            >
              Login
            </button>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;

