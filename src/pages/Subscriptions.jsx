import { useEffect, useState } from "react";
import api from "../api/axios";

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [billingCycle, setBillingCycle] = useState("");

  // EDIT DATA
  const [editData, setEditData] = useState({
    service_name: "",
    amount: "",
    currency: "INR",
    billing_cycle: "Monthly",
    subscription_type: "Paid",
    category: "",
    renewal_date: "",
  });

  // ========================================
  // FETCH SUBSCRIPTIONS
  // ========================================

  useEffect(() => {
    fetchSubscriptions();
  }, [search, category, billingCycle]);

  const fetchSubscriptions = async () => {
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
        "/subscriptions/",
        {
          params: {
            search: search || undefined,
            category: category || undefined,
            billing_cycle:
              billingCycle || undefined,
          },
        }
      );

      console.log(
        "Filtered subscriptions:",
        response.data
      );

      setSubscriptions(response.data);
    } catch (error) {
      console.error(
        "Error fetching subscriptions:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to load subscriptions"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // START EDIT
  // ========================================

  const handleEdit = (subscription) => {
    setEditingId(subscription.id);

    setEditData({
      service_name:
        subscription.service_name || "",
      amount:
        subscription.amount !== null &&
        subscription.amount !== undefined
          ? subscription.amount
          : "",
      currency:
        subscription.currency || "INR",
      billing_cycle:
        subscription.billing_cycle ||
        "Monthly",
      subscription_type:
        subscription.subscription_type ||
        "Paid",
      category:
        subscription.category || "",
      renewal_date:
        subscription.renewal_date || "",
    });

    setError("");
    setSuccess("");
  };

  // ========================================
  // HANDLE EDIT INPUT
  // ========================================

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  // ========================================
  // UPDATE SUBSCRIPTION
  // ========================================

  const updateSubscription = async (id) => {
    setError("");
    setSuccess("");

    if (!editData.service_name.trim()) {
      setError(
        "Please enter the service name."
      );
      return;
    }

    if (
      editData.amount === "" ||
      Number(editData.amount) < 0
    ) {
      setError(
        "Please enter a valid amount."
      );
      return;
    }

    if (!editData.renewal_date) {
      setError(
        "Please select the renewal date."
      );
      return;
    }

    try {
      setSavingId(id);

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please log in again.");
        return;
      }

      const response = await api.put(
        `/subscriptions/${id}`,
        {
          service_name:
            editData.service_name.trim(),
          amount: Number(editData.amount),
          currency: editData.currency,
          billing_cycle:
            editData.billing_cycle,
          subscription_type:
            editData.subscription_type,
          category:
            editData.category.trim(),
          renewal_date:
            editData.renewal_date,
        }
      );

      console.log(
        "Updated subscription:",
        response.data
      );

      setEditingId(null);

      setSuccess(
        "Subscription updated successfully! ✓"
      );

      await fetchSubscriptions();
    } catch (error) {
      console.error(
        "Error updating subscription:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to update subscription"
      );
    } finally {
      setSavingId(null);
    }
  };

  // ========================================
  // DELETE SUBSCRIPTION
  // ========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subscription?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      setDeletingId(id);

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please log in again.");
        return;
      }

      await api.delete(
        `/subscriptions/${id}`
      );

      setSubscriptions(
        (previousSubscriptions) =>
          previousSubscriptions.filter(
            (subscription) =>
              subscription.id !== id
          )
      );

      setSuccess(
        "Subscription deleted successfully! ✓"
      );
    } catch (error) {
      console.error(
        "Error deleting subscription:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to delete subscription."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================
  // CLEAR FILTERS
  // ========================================

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setBillingCycle("");
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
            Loading subscriptions...
          </p>

        </div>

      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>

            <p className="text-sm text-indigo-400 font-medium mb-1">
              Subscription Manager
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              My Subscriptions
            </h1>

            <p className="text-slate-400 mt-2">
              Track and manage all your paid subscriptions.
            </p>

          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3">

            <p className="text-xs text-slate-500">
              Total subscriptions
            </p>

            <p className="text-2xl font-bold text-indigo-300">
              {subscriptions.length}
            </p>

          </div>

        </div>


        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl mb-6">
            ⚠️ {error}
          </div>
        )}


        {/* ================================= */}
        {/* SUCCESS */}
        {/* ================================= */}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-300 p-4 rounded-xl mb-6">
            ✓ {success}
          </div>
        )}


        {/* ================================= */}
        {/* SEARCH & FILTERS */}
        {/* ================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-8">

          <div className="flex items-center gap-2 mb-5">

            <span className="text-xl">
              🔎
            </span>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Search & Filter
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Find subscriptions quickly.
              </p>
            </div>

          </div>


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
                  setSearch(e.target.value)
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
                  setCategory(e.target.value)
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

                <option value="Monthly">
                  Monthly
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
              onClick={clearFilters}
              className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition"
            >
              ✕ Clear all filters
            </button>

          )}

        </div>


        {/* ================================= */}
        {/* NO SUBSCRIPTIONS */}
        {/* ================================= */}

        {subscriptions.length === 0 ? (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

            <div className="text-5xl mb-4">
              💳
            </div>

            <h2 className="text-xl font-semibold text-white">
              No subscriptions found
            </h2>

            <p className="text-slate-500 text-sm mt-2">
              {search ||
              category ||
              billingCycle
                ? "Try changing your search or filters."
                : "Add your first subscription to start tracking your spending."}
            </p>

          </div>

        ) : (

          /* ================================= */
          /* SUBSCRIPTION CARDS */
          /* ================================= */

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {subscriptions.map(
              (subscription) => (

                <div
                  key={subscription.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition"
                >

                  {/* ================================= */}
                  {/* EDIT MODE */}
                  {/* ================================= */}

                  {editingId ===
                  subscription.id ? (

                    <div className="p-6">

                      <div className="flex items-center gap-3 mb-5">

                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                          ✏️
                        </div>

                        <div>

                          <h2 className="text-lg font-semibold text-white">
                            Edit Subscription
                          </h2>

                          <p className="text-xs text-slate-500">
                            Update subscription details.
                          </p>

                        </div>

                      </div>


                      {/* SERVICE NAME */}

                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Service Name
                      </label>

                      <input
                        name="service_name"
                        value={
                          editData.service_name
                        }
                        onChange={
                          handleEditChange
                        }
                        placeholder="Service Name"
                        className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />


                      {/* AMOUNT */}

                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Amount
                      </label>

                      <input
                        name="amount"
                        type="number"
                        min="0"
                        value={
                          editData.amount
                        }
                        onChange={
                          handleEditChange
                        }
                        placeholder="Amount"
                        className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />


                      {/* CURRENCY */}

                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Currency
                      </label>

                      <select
                        name="currency"
                        value={
                          editData.currency
                        }
                        onChange={
                          handleEditChange
                        }
                        className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
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


                      {/* BILLING */}

                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Billing Cycle
                      </label>

                      <select
                        name="billing_cycle"
                        value={
                          editData.billing_cycle
                        }
                        onChange={
                          handleEditChange
                        }
                        className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
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


                      {/* TYPE */}

                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Subscription Type
                      </label>

                      <select
                        name="subscription_type"
                        value={
                          editData.subscription_type
                        }
                        onChange={
                          handleEditChange
                        }
                        className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                      >

                        <option value="Paid">
                          Paid
                        </option>

                        <option value="Free Trial">
                          Free Trial
                        </option>

                      </select>


                      {/* CATEGORY */}

                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Category
                      </label>

                      <input
                        name="category"
                        value={
                          editData.category
                        }
                        onChange={
                          handleEditChange
                        }
                        placeholder="Category"
                        className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />


                      {/* RENEWAL DATE */}

                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Renewal Date
                      </label>

                      <input
                        name="renewal_date"
                        type="date"
                        value={
                          editData.renewal_date
                        }
                        onChange={
                          handleEditChange
                        }
                        className="w-full mb-5 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                      />


                      {/* SAVE / CANCEL */}

                      <div className="flex gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            updateSubscription(
                              subscription.id
                            )
                          }
                          disabled={
                            savingId ===
                            subscription.id
                          }
                          className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition"
                        >
                          {savingId ===
                          subscription.id
                            ? "Saving..."
                            : "✓ Save"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditingId(null)
                          }
                          disabled={
                            savingId ===
                            subscription.id
                          }
                          className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    /* ================================= */
                    /* NORMAL CARD */
                    /* ================================= */

                    <div className="p-6">

                      {/* CARD HEADER */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h2 className="text-xl font-semibold text-white truncate">
                            {
                              subscription.service_name
                            }
                          </h2>

                          <p className="text-sm text-slate-500 mt-1">
                            {
                              subscription.category ||
                              "Not specified"
                            }
                          </p>

                        </div>

                        <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                          💳
                        </div>

                      </div>


                      {/* PRICE */}

                      <div className="mt-6">

                        <p className="text-3xl font-bold text-white">
                          {
                            subscription.currency ||
                            "INR"
                          }{" "}
                          {
                            subscription.amount
                          }
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          per{" "}
                          {
                            subscription.billing_cycle ||
                            "billing cycle"
                          }
                        </p>

                      </div>


                      {/* DETAILS */}

                      <div className="mt-5 space-y-3">

                        <div className="flex items-center justify-between gap-3">

                          <span className="text-sm text-slate-500">
                            Type
                          </span>

                          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                            {
                              subscription.subscription_type ||
                              "Paid"
                            }
                          </span>

                        </div>


                        <div className="flex items-center justify-between gap-3">

                          <span className="text-sm text-slate-500">
                            Billing
                          </span>

                          <span className="text-sm text-slate-300">
                            {
                              subscription.billing_cycle ||
                              "Monthly"
                            }
                          </span>

                        </div>


                        <div className="border-t border-slate-800 pt-3">

                          <p className="text-xs text-slate-500">
                            Renewal Date
                          </p>

                          <p className="text-sm font-medium text-white mt-1">
                            📅{" "}
                            {
                              subscription.renewal_date
                            }
                          </p>

                        </div>

                      </div>


                      {/* ACTION BUTTONS */}

                      <div className="flex gap-3 mt-6">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              subscription
                            )
                          }
                          disabled={
                            deletingId ===
                            subscription.id
                          }
                          className="flex-1 px-3 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed transition"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              subscription.id
                            )
                          }
                          disabled={
                            deletingId ===
                            subscription.id
                          }
                          className="flex-1 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-medium hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {deletingId ===
                          subscription.id
                            ? "Deleting..."
                            : "🗑️ Delete"}
                        </button>

                      </div>

                    </div>

                  )}

                </div>

              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Subscriptions;