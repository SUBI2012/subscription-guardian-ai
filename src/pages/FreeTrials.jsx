import { useEffect, useState } from "react";
import api from "../api/axios";

function FreeTrials() {
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [billingCycle, setBillingCycle] = useState("");

  // FORM DATA
  const [formData, setFormData] = useState({
    service_name: "",
    start_date: "",
    end_date: "",
    amount_after_trial: "",
    currency: "INR",
    billing_cycle: "Monthly",
    category: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ========================================
  // FILTERING
  // ========================================

  const filteredTrials = trials.filter((trial) => {
    const matchesSearch =
      (trial.service_name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      !category ||
      trial.category === category;

    const matchesBillingCycle =
      !billingCycle ||
      trial.billing_cycle === billingCycle;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBillingCycle
    );
  });

  // ========================================
  // GET FREE TRIALS
  // ========================================

  const fetchTrials = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please log in again.");
        setLoading(false);
        return;
      }

      const response = await api.get(
        "/free-trials/"
      );

      console.log(
        "Free Trials:",
        response.data
      );

      setTrials(response.data);
    } catch (error) {
      console.error(
        "Error fetching free trials:",
        error
      );

      if (error.response) {
        setError(
          error.response.data.detail ||
            "Failed to load free trials"
        );
      } else {
        setError(
          "Cannot connect to the backend."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrials();
  }, []);

  // ========================================
  // HANDLE INPUT
  // ========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ========================================
  // GET TRIAL STATUS
  // ========================================

  const getTrialStatus = (endDate) => {
    if (!endDate) {
      return {
        text: "Unknown",
        className:
          "text-slate-400 bg-slate-800 border-slate-700",
        dot: "bg-slate-500",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const difference =
      end.getTime() - today.getTime();

    const daysRemaining = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 0) {
      return {
        text: "Expired",
        className:
          "text-slate-400 bg-slate-800 border-slate-700",
        dot: "bg-slate-500",
      };
    }

    if (daysRemaining === 0) {
      return {
        text: "Ends today!",
        className:
          "text-red-300 bg-red-500/10 border-red-500/20",
        dot: "bg-red-400",
      };
    }

    if (daysRemaining === 1) {
      return {
        text: "1 day remaining",
        className:
          "text-red-300 bg-red-500/10 border-red-500/20",
        dot: "bg-red-400",
      };
    }

    if (daysRemaining <= 3) {
      return {
        text: `${daysRemaining} days remaining`,
        className:
          "text-orange-300 bg-orange-500/10 border-orange-500/20",
        dot: "bg-orange-400",
      };
    }

    if (daysRemaining <= 7) {
      return {
        text: `${daysRemaining} days remaining`,
        className:
          "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
        dot: "bg-yellow-400",
      };
    }

    return {
      text: `${daysRemaining} days remaining`,
      className:
        "text-green-300 bg-green-500/10 border-green-500/20",
      dot: "bg-green-400",
    };
  };

  // ========================================
  // ADD / UPDATE FREE TRIAL
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.service_name.trim()) {
      setError(
        "Please enter the service name."
      );
      return;
    }

    if (!formData.start_date) {
      setError(
        "Please select the start date."
      );
      return;
    }

    if (!formData.end_date) {
      setError(
        "Please select the end date."
      );
      return;
    }

    if (
      formData.end_date <
      formData.start_date
    ) {
      setError(
        "End date cannot be before the start date."
      );
      return;
    }

    if (
      formData.amount_after_trial === "" ||
      Number(formData.amount_after_trial) < 0
    ) {
      setError(
        "Please enter a valid amount."
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please log in again.");
        return;
      }

      const data = {
        service_name:
          formData.service_name.trim(),
        start_date:
          formData.start_date,
        end_date:
          formData.end_date,
        amount_after_trial:
          Number(
            formData.amount_after_trial
          ),
        currency:
          formData.currency,
        billing_cycle:
          formData.billing_cycle,
        category:
          formData.category.trim(),
      };

      if (editingId) {
        await api.put(
          `/free-trials/${editingId}`,
          data
        );

        setMessage(
          "Free trial updated successfully! 🎉"
        );
      } else {
        await api.post(
          "/free-trials/",
          data
        );

        setMessage(
          "Free trial added successfully! 🎉"
        );
      }

      setFormData({
        service_name: "",
        start_date: "",
        end_date: "",
        amount_after_trial: "",
        currency: "INR",
        billing_cycle: "Monthly",
        category: "",
      });

      setEditingId(null);

      await fetchTrials();
    } catch (error) {
      console.error(
        "Error saving free trial:",
        error
      );

      if (error.response) {
        setError(
          error.response.data.detail ||
            "Operation failed"
        );
      } else {
        setError(
          "Cannot connect to the backend."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // EDIT FREE TRIAL
  // ========================================

  const handleEdit = (trial) => {
    setEditingId(trial.id);

    setFormData({
      service_name:
        trial.service_name || "",
      start_date:
        trial.start_date || "",
      end_date:
        trial.end_date || "",
      amount_after_trial:
        trial.amount_after_trial ?? "",
      currency:
        trial.currency || "INR",
      billing_cycle:
        trial.billing_cycle ||
        "Monthly",
      category:
        trial.category || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================
  // DELETE FREE TRIAL
  // ========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this free trial?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");
      setDeletingId(id);

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please log in again.");
        return;
      }

      await api.delete(
        `/free-trials/${id}`
      );

      setTrials(
        (previousTrials) =>
          previousTrials.filter(
            (trial) =>
              trial.id !== id
          )
      );

      setMessage(
        "Free trial deleted successfully! 🗑️"
      );
    } catch (error) {
      console.error(
        "Error deleting free trial:",
        error
      );

      if (error.response) {
        setError(
          error.response.data.detail ||
            "Failed to delete free trial."
        );
      } else {
        setError(
          "Cannot connect to the backend."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================
  // CANCEL EDIT
  // ========================================

  const cancelEdit = () => {
    setEditingId(null);

    setFormData({
      service_name: "",
      start_date: "",
      end_date: "",
      amount_after_trial: "",
      currency: "INR",
      billing_cycle: "Monthly",
      category: "",
    });

    setMessage("");
    setError("");
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

        <div className="text-center">

          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-400">
            Loading free trials...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-8">

          <p className="text-sm text-indigo-400 font-medium mb-1">
            Free Trial Manager
          </p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Free Trials
              </h1>

              <p className="text-slate-400 mt-2">
                Track trial periods and avoid unexpected charges.
              </p>

            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3">

              <p className="text-xs text-slate-500">
                Active results
              </p>

              <p className="text-2xl font-bold text-indigo-300">
                {filteredTrials.length}
              </p>

            </div>

          </div>

        </div>


        {/* ================================= */}
        {/* SUCCESS MESSAGE */}
        {/* ================================= */}

        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-300 p-4 rounded-xl mb-6">
            ✓ {message}
          </div>
        )}


        {/* ================================= */}
        {/* ERROR MESSAGE */}
        {/* ================================= */}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl mb-6">
            ⚠️ {error}
          </div>
        )}


        {/* ================================= */}
        {/* FORM */}
        {/* ================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-8">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl">
              {editingId ? "✏️" : "🎁"}
            </div>

            <div>

              <h2 className="text-xl font-semibold text-white">
                {editingId
                  ? "Edit Free Trial"
                  : "Add Free Trial"}
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {editingId
                  ? "Update your trial details."
                  : "Add a free trial to keep track of its expiry date."}
              </p>

            </div>

          </div>


          <form
            onSubmit={handleSubmit}
            className="grid gap-5"
          >

            {/* SERVICE NAME */}

            <div>

              <label className="block text-xs font-medium text-slate-400 mb-2">
                Service Name
              </label>

              <input
                type="text"
                name="service_name"
                placeholder="Example: Netflix"
                value={
                  formData.service_name
                }
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />

            </div>


            {/* DATES */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Start Date
                </label>

                <input
                  type="date"
                  name="start_date"
                  value={
                    formData.start_date
                  }
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 bg-slate-800 border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />

              </div>


              <div>

                <label className="block text-xs font-medium text-slate-400 mb-2">
                  End Date
                </label>

                <input
                  type="date"
                  name="end_date"
                  value={
                    formData.end_date
                  }
                  min={
                    formData.start_date ||
                    undefined
                  }
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 bg-slate-800 border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />

              </div>

            </div>


            {/* AMOUNT / CURRENCY */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Amount After Trial
                </label>

                <input
                  type="number"
                  name="amount_after_trial"
                  placeholder="Example: 649"
                  min="0"
                  step="0.01"
                  value={
                    formData.amount_after_trial
                  }
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />

              </div>


              <div>

                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Currency
                </label>

                <select
                  name="currency"
                  value={
                    formData.currency
                  }
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 bg-slate-800 border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >

                  <option value="INR">
                    INR
                  </option>

                  <option value="USD">
                    USD
                  </option>

                  <option value="EUR">
                    EUR
                  </option>

                  <option value="GBP">
                    GBP
                  </option>

                </select>

              </div>

            </div>


            {/* BILLING / CATEGORY */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Billing Cycle
                </label>

                <select
                  name="billing_cycle"
                  value={
                    formData.billing_cycle
                  }
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 bg-slate-800 border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >

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


              <div>

                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  placeholder="Example: Entertainment"
                  value={
                    formData.category
                  }
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />

              </div>

            </div>


            {/* FORM BUTTONS */}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">

              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "✓ Update Free Trial"
                  : "＋ Add Free Trial"}
              </button>


              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex-1 sm:flex-none bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>


        {/* ================================= */}
        {/* TRIAL LIST HEADER */}
        {/* ================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

          <div>

            <h2 className="text-2xl font-semibold text-white">
              Your Free Trials
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Monitor upcoming trial expirations.
            </p>

          </div>

          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="text-slate-300 font-medium">
              {filteredTrials.length}
            </span>{" "}
            trial
            {filteredTrials.length !== 1
              ? "s"
              : ""}
          </div>

        </div>


        {/* ================================= */}
        {/* SEARCH & FILTERS */}
        {/* ================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* SEARCH */}

            <div>

              <label className="block text-xs font-medium text-slate-400 mb-2">
                Search
              </label>

              <input
                type="text"
                placeholder="Search service name..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3 bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />

            </div>


            {/* CATEGORY */}

            <div>

              <label className="block text-xs font-medium text-slate-400 mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3 bg-slate-800 border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >

                <option value="">
                  All Categories
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Music">
                  Music
                </option>

                <option value="Productivity">
                  Productivity
                </option>

                <option value="Education">
                  Education
                </option>

                <option value="Cloud Storage">
                  Cloud Storage
                </option>

                <option value="Other">
                  Other
                </option>

                <option value="AI Detected">
                  AI Detected
                </option>

              </select>

            </div>


            {/* BILLING */}

            <div>

              <label className="block text-xs font-medium text-slate-400 mb-2">
                Billing Cycle
              </label>

              <select
                value={billingCycle}
                onChange={(e) =>
                  setBillingCycle(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3 bg-slate-800 border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >

                <option value="">
                  All Billing Cycles
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

          </div>


          {/* CLEAR FILTERS */}

          {(search ||
            category ||
            billingCycle) && (

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("");
                setBillingCycle("");
              }}
              className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition"
            >
              ✕ Clear all filters
            </button>

          )}

        </div>


        {/* ================================= */}
        {/* RESULTS */}
        {/* ================================= */}

        {trials.length === 0 ? (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

            <div className="text-5xl mb-4">
              🎁
            </div>

            <h2 className="text-xl font-semibold text-white">
              No free trials yet
            </h2>

            <p className="text-slate-500 text-sm mt-2">
              Add your first free trial above to start tracking it.
            </p>

          </div>

        ) : filteredTrials.length === 0 ? (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

            <div className="text-4xl mb-4">
              🔎
            </div>

            <h2 className="text-xl font-semibold text-white">
              No matching trials
            </h2>

            <p className="text-slate-500 text-sm mt-2">
              Try changing your search or filters.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {filteredTrials.map(
              (trial) => {

                const trialStatus =
                  getTrialStatus(
                    trial.end_date
                  );

                return (

                  <div
                    key={trial.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition"
                  >

                    <div className="p-6">

                      {/* CARD HEADER */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3 className="text-xl font-semibold text-white truncate">
                            {
                              trial.service_name
                            }
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            {
                              trial.category ||
                              "Not specified"
                            }
                          </p>

                        </div>

                        <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center text-lg">
                          🎁
                        </div>

                      </div>


                      {/* STATUS */}

                      <div className="mt-5">

                        <span
                          className={
                            "inline-flex items-center gap-2 border rounded-full px-3 py-1.5 text-xs font-semibold " +
                            trialStatus.className
                          }
                        >

                          <span
                            className={
                              "w-1.5 h-1.5 rounded-full " +
                              trialStatus.dot
                            }
                          />

                          {
                            trialStatus.text
                          }

                        </span>

                      </div>


                      {/* DATES */}

                      <div className="mt-5 space-y-3">

                        <div className="flex items-center justify-between gap-3">

                          <span className="text-sm text-slate-500">
                            Start
                          </span>

                          <span className="text-sm text-slate-300">
                            📅{" "}
                            {
                              trial.start_date
                            }
                          </span>

                        </div>


                        <div className="flex items-center justify-between gap-3">

                          <span className="text-sm text-slate-500">
                            Ends
                          </span>

                          <span className="text-sm font-medium text-white">
                            📅{" "}
                            {
                              trial.end_date
                            }
                          </span>

                        </div>


                        <div className="border-t border-slate-800 pt-3">

                          <div className="flex items-end justify-between gap-3">

                            <div>

                              <p className="text-xs text-slate-500">
                                After trial
                              </p>

                              <p className="text-2xl font-bold text-white mt-1">
                                {
                                  trial.currency ||
                                  "INR"
                                }{" "}
                                {
                                  trial.amount_after_trial
                                }
                              </p>

                            </div>

                            <span className="text-xs text-slate-500 pb-1">
                              per{" "}
                              {
                                trial.billing_cycle ||
                                "billing cycle"
                              }
                            </span>

                          </div>

                        </div>


                        {/* EXTRA DETAILS */}

                        <div className="flex items-center justify-between gap-3">

                          <span className="text-sm text-slate-500">
                            Database status
                          </span>

                          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                            {
                              trial.status ||
                              "Active"
                            }
                          </span>

                        </div>

                      </div>


                      {/* ACTION BUTTONS */}

                      <div className="flex gap-3 mt-6">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              trial
                            )
                          }
                          disabled={
                            deletingId ===
                            trial.id
                          }
                          className="flex-1 px-3 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed transition"
                        >
                          ✏️ Edit
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              trial.id
                            )
                          }
                          disabled={
                            deletingId ===
                            trial.id
                          }
                          className="flex-1 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-medium hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {deletingId ===
                          trial.id
                            ? "Deleting..."
                            : "🗑️ Delete"}
                        </button>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default FreeTrials;