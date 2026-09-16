import { useState } from "react";
import api from "../api/axios";

function AIParser() {
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ------------------------------------------------------
  // Sample emails for quick testing
  // ------------------------------------------------------

  const sampleEmails = {
    netflix:
      "Your Netflix subscription will renew on September 20, 2026 for ₹649. You will be billed monthly.",

    spotify:
      "Your Spotify Premium subscription will renew on October 5, 2026. You will be charged ₹119 monthly.",

    freeTrial:
      "Welcome to Canva Pro! Your free trial ends on September 25, 2026. After the trial, you will be charged ₹499 monthly.",
  };

  // ------------------------------------------------------
  // Load sample email
  // ------------------------------------------------------

  const handleSampleEmail = (type) => {
    setEmailText(sampleEmails[type]);
    setResult(null);
    setSaved(false);
    setMessage("");
    setMessageType("");
  };

  // ------------------------------------------------------
  // Analyze email
  // ------------------------------------------------------

  const handleParse = async () => {
    if (!emailText.trim()) {
      setMessage(
        "Please enter an email or subscription message."
      );
      setMessageType("error");
      return;
    }

    setLoading(true);
    setResult(null);
    setSaved(false);
    setMessage("");
    setMessageType("");

    try {
      const response = await api.post("/ai/parse", {
        text: emailText,
      });

      const parsedData = response.data?.data;

      if (!parsedData) {
        throw new Error(
          "The AI did not return any subscription details."
        );
      }

      setResult(parsedData);

      setMessage(
        "Subscription details detected successfully."
      );
      setMessageType("success");
    } catch (error) {
      console.error("AI Parse Error:", error);

      setMessage(
        error.response?.data?.detail ||
          error.message ||
          "Unable to analyze the email."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // Update detected field manually
  // ------------------------------------------------------

  const handleResultChange = (field, value) => {
    setResult((previousResult) => ({
      ...previousResult,
      [field]: value,
    }));

    setSaved(false);

    if (messageType === "success") {
      setMessage("");
      setMessageType("");
    }
  };

  // ------------------------------------------------------
  // Validate result before saving
  // ------------------------------------------------------

  const validateResult = () => {
    if (!result?.service_name?.trim()) {
      return "Please enter a service name before saving.";
    }

    if (!result.subscription_type) {
      return "Please select the subscription type before saving.";
    }

    if (!result.renewal_date) {
      return "Please enter the renewal or expiry date before saving.";
    }

    if (
      result.amount === null ||
      result.amount === undefined ||
      result.amount === ""
    ) {
      if (result.subscription_type === "Paid") {
        return "Please enter the subscription amount before saving.";
      }
    }

    if (
      result.amount !== null &&
      result.amount !== undefined &&
      result.amount !== ""
    ) {
      const numericAmount = Number(result.amount);

      if (
        Number.isNaN(numericAmount) ||
        numericAmount < 0
      ) {
        return "Please enter a valid amount.";
      }
    }

    return "";
  };

  // ------------------------------------------------------
  // Save subscription / free trial
  // ------------------------------------------------------

  const handleSave = async () => {
    if (!result || saved || saving) {
      return;
    }

    const validationError = validateResult();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      // --------------------------------------------------
      // FREE TRIAL
      // --------------------------------------------------

      if (result.subscription_type === "Free Trial") {
        await api.post("/free-trials/", {
          service_name: result.service_name.trim(),

          start_date: new Date()
            .toISOString()
            .split("T")[0],

          end_date: result.renewal_date,

          amount_after_trial:
            result.amount === null ||
            result.amount === undefined ||
            result.amount === ""
              ? 0
              : Number(result.amount),

          currency: result.currency || "INR",

          billing_cycle:
            result.billing_cycle || "Monthly",

          category: "AI Detected",
        });

        setSaved(true);

        setMessage(
          `Free trial for ${result.service_name} saved successfully!`
        );

        setMessageType("success");
      }

      // --------------------------------------------------
      // PAID SUBSCRIPTION
      // --------------------------------------------------

      else {
        await api.post("/subscriptions/", {
          service_name: result.service_name.trim(),

          amount: Number(result.amount),

          currency: result.currency || "INR",

          billing_cycle:
            result.billing_cycle || "Monthly",

          subscription_type: "Paid",

          category: "AI Detected",

          renewal_date: result.renewal_date,
        });

        setSaved(true);

        setMessage(
          `${result.service_name} subscription saved successfully!`
        );

        setMessageType("success");
      }
    } catch (error) {
      console.error("Save Error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Unable to save the subscription."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------
  // Clear everything
  // ------------------------------------------------------

  const handleClear = () => {
    setEmailText("");
    setResult(null);
    setSaved(false);
    setMessage("");
    setMessageType("");
  };

  // ------------------------------------------------------
  // Find missing information
  // ------------------------------------------------------

  const getMissingFields = () => {
    if (!result) {
      return [];
    }

    const missing = [];

    if (!result.service_name?.trim()) {
      missing.push("Service Name");
    }

    if (!result.subscription_type) {
      missing.push("Subscription Type");
    }

    if (
      result.amount === null ||
      result.amount === undefined ||
      result.amount === ""
    ) {
      missing.push("Amount");
    }

    if (!result.currency) {
      missing.push("Currency");
    }

    if (!result.billing_cycle) {
      missing.push("Billing Cycle");
    }

    if (!result.renewal_date) {
      missing.push("Renewal / Expiry Date");
    }

    return missing;
  };

  const missingFields = getMissingFields();

  // ------------------------------------------------------
  // Determine subscription type
  // ------------------------------------------------------

  const isFreeTrial =
    result?.subscription_type === "Free Trial";

  // ------------------------------------------------------
  // UI
  // ------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ------------------------------------------------
            HEADER
        ------------------------------------------------ */}

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-2xl">
              🤖
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                AI Subscription Parser
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Automatically extract subscription and free-trial
                details from emails.
              </p>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------
            INPUT CARD
        ------------------------------------------------ */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Paste Subscription Email
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Paste an email or billing message below and let
              AI extract the important information.
            </p>
          </div>

          <textarea
            value={emailText}
            onChange={(e) =>
              setEmailText(e.target.value)
            }
            placeholder="Example: Your Netflix subscription will renew on September 20, 2026 for ₹649. You will be billed monthly."
            rows={9}
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-sm leading-6 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />

          {/* ------------------------------------------------
              SAMPLE EMAILS
          ------------------------------------------------ */}

          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm">🧪</span>

              <p className="text-sm font-semibold text-slate-300">
                Quick Test Examples
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleSampleEmail("netflix")
                }
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500/40 hover:bg-slate-700 hover:text-white"
              >
                Netflix
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSampleEmail("spotify")
                }
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500/40 hover:bg-slate-700 hover:text-white"
              >
                Spotify
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSampleEmail("freeTrial")
                }
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500/40 hover:bg-slate-700 hover:text-white"
              >
                Canva Free Trial
              </button>
            </div>
          </div>

          {/* ------------------------------------------------
              BUTTONS
          ------------------------------------------------ */}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleParse}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "🤖 Analyzing..."
                : "🤖 Analyze with AI"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Clear
            </button>
          </div>

          {/* ------------------------------------------------
              MESSAGE
          ------------------------------------------------ */}

          {message && (
            <div
              className={`mt-5 rounded-xl border p-4 ${
                messageType === "success"
                  ? "border-green-500/20 bg-green-500/10 text-green-300"
                  : "border-red-500/20 bg-red-500/10 text-red-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">
                  {messageType === "success"
                    ? "✓"
                    : "⚠️"}
                </span>

                <p className="text-sm leading-6">
                  {message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------
            RESULT
        ------------------------------------------------ */}

        {result && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">

            {/* Result Header */}

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    ✨
                  </span>

                  <h2 className="text-2xl font-bold text-white">
                    Detected Details
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Review the AI results and edit any field
                  before saving.
                </p>
              </div>

              <div className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
                AI Detected
              </div>
            </div>

            {/* ------------------------------------------------
                SAVED SUCCESS
            ------------------------------------------------ */}

            {saved && (
              <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold text-green-300">
                      Saved Successfully
                    </h3>

                    <p className="mt-1 text-sm text-green-400/80">
                      This information has been added to
                      your Subscription Guardian account.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------
                MISSING INFORMATION
            ------------------------------------------------ */}

            {missingFields.length > 0 && !saved && (
              <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    ⚠️
                  </span>

                  <div>
                    <h3 className="font-semibold text-yellow-300">
                      Some information was not detected
                    </h3>

                    <p className="mt-1 text-sm text-yellow-400/80">
                      Please complete the fields below
                      before saving.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {missingFields.map(
                        (field) => (
                          <span
                            key={field}
                            className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-300"
                          >
                            {field}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------
                DETECTED FIELDS
            ------------------------------------------------ */}

            <div className="grid gap-4 md:grid-cols-2">

              {/* Service Name */}

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Service Name
                </label>

                <input
                  type="text"
                  value={result.service_name || ""}
                  onChange={(e) =>
                    handleResultChange(
                      "service_name",
                      e.target.value
                    )
                  }
                  placeholder="Example: Netflix"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Subscription Type */}

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Subscription Type
                </label>

                <select
                  value={
                    result.subscription_type || ""
                  }
                  onChange={(e) =>
                    handleResultChange(
                      "subscription_type",
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">
                    Select type
                  </option>

                  <option value="Paid">
                    Paid Subscription
                  </option>

                  <option value="Free Trial">
                    Free Trial
                  </option>
                </select>
              </div>

              {/* Amount */}

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {isFreeTrial
                    ? "Amount After Trial"
                    : "Subscription Amount"}
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    result.amount === null ||
                    result.amount === undefined
                      ? ""
                      : result.amount
                  }
                  onChange={(e) =>
                    handleResultChange(
                      "amount",
                      e.target.value
                    )
                  }
                  placeholder="Example: 649"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Currency */}

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Currency
                </label>

                <select
                  value={result.currency || ""}
                  onChange={(e) =>
                    handleResultChange(
                      "currency",
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">
                    Select currency
                  </option>

                  <option value="INR">
                    INR - Indian Rupee
                  </option>

                  <option value="USD">
                    USD - US Dollar
                  </option>

                  <option value="EUR">
                    EUR - Euro
                  </option>

                  <option value="GBP">
                    GBP - British Pound
                  </option>
                </select>
              </div>

              {/* Billing Cycle */}

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Billing Cycle
                </label>

                <select
                  value={
                    result.billing_cycle || ""
                  }
                  onChange={(e) =>
                    handleResultChange(
                      "billing_cycle",
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">
                    Select billing cycle
                  </option>

                  <option value="Daily">
                    Daily
                  </option>

                  <option value="Weekly">
                    Weekly
                  </option>

                  <option value="Biweekly">
                    Biweekly
                  </option>

                  <option value="Monthly">
                    Monthly
                  </option>

                  <option value="Quarterly">
                    Quarterly
                  </option>

                  <option value="Half-Yearly">
                    Half-Yearly
                  </option>

                  <option value="Yearly">
                    Yearly
                  </option>
                </select>
              </div>

              {/* Renewal Date */}

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {isFreeTrial
                    ? "Trial Expiry Date"
                    : "Renewal Date"}
                </label>

                <input
                  type="date"
                  value={
                    result.renewal_date || ""
                  }
                  onChange={(e) =>
                    handleResultChange(
                      "renewal_date",
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* ------------------------------------------------
                SAVE BUTTON
            ------------------------------------------------ */}

            <div className="mt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || saved}
                className={`w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition ${
                  saved
                    ? "cursor-not-allowed bg-green-700/50"
                    : "bg-green-600 hover:bg-green-500"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {saving
                  ? "💾 Saving..."
                  : saved
                    ? "✓ Already Saved"
                    : isFreeTrial
                      ? "🎁 Save to Free Trials"
                      : "💳 Save to My Subscriptions"}
              </button>
            </div>

            {/* ------------------------------------------------
                INFO
            ------------------------------------------------ */}

            {!saved && (
              <p className="mt-3 text-center text-xs text-slate-600">
                Review the detected information before
                saving it to your account.
              </p>
            )}
          </div>
        )}

        {/* ------------------------------------------------
            EMPTY STATE
        ------------------------------------------------ */}

        {!result && !loading && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 px-6 py-12 text-center">
            <div className="text-5xl">
              🤖
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              Ready to analyze your email
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Paste a subscription email above or choose
              one of the quick test examples to see the AI
              parser in action.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default AIParser;