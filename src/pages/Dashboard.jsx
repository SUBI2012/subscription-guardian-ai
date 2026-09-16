import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reminders, setReminders] = useState([]);
  const [readReminders, setReadReminders] = useState([]);

  // ========================================
  // MARK REMINDER AS READ
  // ========================================

  const markAsRead = (reminderKey) => {
    setReadReminders((previous) => {
      if (previous.includes(reminderKey)) {
        return previous;
      }

      return [...previous, reminderKey];
    });
  };

  // ========================================
  // GET REMINDER PRIORITY STYLE
  // ========================================

  const getReminderPriority = (priority) => {
    if (priority === "Urgent") {
      return {
        className:
          "text-red-300 bg-red-500/10 border-red-500/20",
        icon: "🚨",
      };
    }

    if (priority === "High") {
      return {
        className:
          "text-orange-300 bg-orange-500/10 border-orange-500/20",
        icon: "⚠️",
      };
    }

    return {
      className:
        "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
      icon: "🔔",
    };
  };

  // ========================================
  // GET REMINDER TIME TEXT
  // ========================================

  const getReminderTimeText = (days) => {
    if (days === 0) {
      return "Today";
    }

    if (days === 1) {
      return "Tomorrow";
    }

    if (days < 0) {
      return "Expired";
    }

    return `${days} days remaining`;
  };

  // ========================================
  // FETCH DASHBOARD DATA
  // ========================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          setError("Please log in again.");
          setLoading(false);
          return;
        }

        const response = await api.get(
          "/dashboard/"
        );

        console.log(
          "Dashboard data:",
          response.data
        );

        setDashboard(response.data);
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        if (error.response) {
          setError(
            error.response.data.detail ||
              "Failed to load dashboard."
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

    const fetchReminders = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await api.get(
          "/reminders/"
        );

        console.log(
          "Reminders:",
          response.data
        );

        setReminders(
          response.data.reminders || []
        );
      } catch (error) {
        console.error(
          "Failed to load reminders:",
          error
        );

        setReminders([]);
      }
    };

    fetchDashboard();
    fetchReminders();
  }, []);

  // ========================================
  // SPENDING BY CATEGORY DATA
  // ========================================

  const chartData =
    dashboard?.category_spending
      ? Object.entries(
          dashboard.category_spending
        ).map(([name, value]) => ({
          name,
          value: Number(value),
        }))
      : [];

  // ========================================
  // MONTHLY / YEARLY SPENDING DATA
  // ========================================

  const monthlyData = [
    {
      month: "Monthly",
      amount:
        Number(
          dashboard?.monthly_spending
        ) || 0,
    },
    {
      month: "Yearly",
      amount:
        Number(
          dashboard?.yearly_spending
        ) || 0,
    },
  ];

  // ========================================
  // CATEGORY COUNTS
  // ========================================

  const categoryCounts =
    dashboard?.category_counts || {};

  // ========================================
  // UPCOMING COUNT
  // ========================================

  const upcomingCount =
    (dashboard?.upcoming_subscriptions
      ?.length || 0) +
    (dashboard?.upcoming_free_trials
      ?.length || 0);

  // ========================================
  // RENEWAL STATUS
  // ========================================

  const getRenewalStatus = (days) => {
    if (days === 0) {
      return {
        text: "Renewing today",
        className:
          "text-red-300 bg-red-500/10 border-red-500/20",
      };
    }

    if (days === 1) {
      return {
        text: "1 day remaining",
        className:
          "text-red-300 bg-red-500/10 border-red-500/20",
      };
    }

    if (days <= 3) {
      return {
        text: `${days} days remaining`,
        className:
          "text-orange-300 bg-orange-500/10 border-orange-500/20",
      };
    }

    if (days <= 7) {
      return {
        text: `${days} days remaining`,
        className:
          "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
      };
    }

    return {
      text: `${days} days remaining`,
      className:
        "text-green-300 bg-green-500/10 border-green-500/20",
    };
  };

  // ========================================
  // REMINDER COUNTS
  // ========================================

  const unreadReminderCount =
    reminders.filter(
      (reminder) =>
        !readReminders.includes(
          `${reminder.type}-${reminder.id}`
        )
    ).length;

  const urgentReminderCount =
    reminders.filter(
      (reminder) =>
        reminder.priority === "Urgent"
    ).length;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">

      <div className="max-w-7xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          <div>
            <p className="text-sm text-indigo-400 font-medium mb-1">
              Subscription Guardian
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Dashboard
            </h1>

            <p className="text-slate-400 mt-2">
              Manage your subscriptions and
              free trials in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/add-subscription"
              )
            }
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-semibold transition shadow-lg shadow-indigo-500/10"
          >
            + Add Subscription
          </button>

        </div>


        {/* ================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mt-6 mb-8">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">
              ⚡ Quick Actions
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              Quickly access the most important
              features.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* ADD */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/add-subscription"
                )
              }
              className="group border border-slate-800 bg-slate-950/50 rounded-xl p-5 text-left hover:border-indigo-500/50 hover:bg-indigo-500/5 transition"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition">
                ➕
              </div>

              <h3 className="font-bold text-lg text-white">
                Add Subscription
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                Add a new paid subscription.
              </p>
            </button>


            {/* SUBSCRIPTIONS */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/subscriptions"
                )
              }
              className="group border border-slate-800 bg-slate-950/50 rounded-xl p-5 text-left hover:border-indigo-500/50 hover:bg-indigo-500/5 transition"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition">
                📋
              </div>

              <h3 className="font-bold text-lg text-white">
                My Subscriptions
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                View and manage subscriptions.
              </p>
            </button>


            {/* FREE TRIALS */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/free-trials"
                )
              }
              className="group border border-slate-800 bg-slate-950/50 rounded-xl p-5 text-left hover:border-indigo-500/50 hover:bg-indigo-500/5 transition"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition">
                ⏳
              </div>

              <h3 className="font-bold text-lg text-white">
                Free Trials
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                Track your free trials.
              </p>
            </button>


            {/* AI PARSER */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/ai-parser"
                )
              }
              className="group border border-slate-800 bg-slate-950/50 rounded-xl p-5 text-left hover:border-indigo-500/50 hover:bg-indigo-500/5 transition"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition">
                🤖
              </div>

              <h3 className="font-bold text-lg text-white">
                AI Email Parser
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                Extract subscription details
                from emails.
              </p>
            </button>

          </div>

        </div>


        {/* ================================= */}
        {/* LOADING */}
        {/* ================================= */}

        {loading && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mt-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />

              <p className="text-slate-400">
                Loading dashboard...
              </p>
            </div>
          </div>
        )}


        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl mt-6">
            ⚠️ {error}
          </div>
        )}


        {/* ================================= */}
        {/* DASHBOARD CONTENT */}
        {/* ================================= */}

        {dashboard && (
          <>

            {/* ================================= */}
            {/* SUMMARY CARDS */}
            {/* ================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6 mb-8">

              {/* ACTIVE */}

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/30 transition">

                <div className="flex items-center justify-between">

                  <p className="text-slate-400 text-sm">
                    Active Subscriptions
                  </p>

                  <span className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    🔄
                  </span>

                </div>

                <h2 className="text-3xl font-bold text-white mt-4">
                  {dashboard?.active_subscriptions || 0}
                </h2>

                <p className="text-xs text-slate-600 mt-2">
                  Currently tracked
                </p>

              </div>


              {/* MONTHLY */}

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/30 transition">

                <div className="flex items-center justify-between">

                  <p className="text-slate-400 text-sm">
                    Monthly Spending
                  </p>

                  <span className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    💰
                  </span>

                </div>

                <h2 className="text-3xl font-bold text-white mt-4">
                  ₹
                  {Number(
                    dashboard?.monthly_spending
                  ).toFixed(2)}
                </h2>

                <p className="text-xs text-slate-600 mt-2">
                  Estimated recurring cost
                </p>

              </div>


              {/* YEARLY */}

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/30 transition">

                <div className="flex items-center justify-between">

                  <p className="text-slate-400 text-sm">
                    Yearly Spending
                  </p>

                  <span className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    📅
                  </span>

                </div>

                <h2 className="text-3xl font-bold text-white mt-4">
                  ₹
                  {Number(
                    dashboard?.yearly_spending
                  ).toFixed(2)}
                </h2>

                <p className="text-xs text-slate-600 mt-2">
                  Estimated annual cost
                </p>

              </div>


              {/* UPCOMING */}

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/30 transition">

                <div className="flex items-center justify-between">

                  <p className="text-slate-400 text-sm">
                    Upcoming
                  </p>

                  <span className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    ⚠️
                  </span>

                </div>

                <h2 className="text-3xl font-bold text-white mt-4">
                  {upcomingCount}
                </h2>

                <p className="text-xs text-slate-600 mt-2">
                  Next 7 days
                </p>

              </div>

            </div>


            {/* ================================= */}
            {/* CHARTS */}
            {/* ================================= */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

              {/* PIE CHART */}

              <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl">

                <div className="mb-4">

                  <h2 className="text-xl font-bold text-white">
                    📊 Spending by Category
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Monthly spending distribution
                  </p>

                </div>

                {chartData.length > 0 ? (

                  <div className="w-full h-[320px]">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>

                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={105}
                          label
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              "#0f172a",
                            border:
                              "1px solid #334155",
                            borderRadius:
                              "12px",
                            color: "#fff",
                          }}
                        />

                        <Legend />

                      </PieChart>
                    </ResponsiveContainer>

                  </div>

                ) : (

                  <div className="h-[320px] flex items-center justify-center">

                    <p className="text-slate-500">
                      No spending data available.
                    </p>

                  </div>

                )}

              </div>


              {/* BAR CHART */}

              <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl">

                <div className="mb-4">

                  <h2 className="text-xl font-bold text-white">
                    📈 Spending Overview
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Monthly vs yearly estimate
                  </p>

                </div>

                <div className="w-full h-[320px]">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={monthlyData}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                      />

                      <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                      />

                      <YAxis
                        stroke="#94a3b8"
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor:
                            "#0f172a",
                          border:
                            "1px solid #334155",
                          borderRadius:
                            "12px",
                          color: "#fff",
                        }}
                      />

                      <Bar
                        dataKey="amount"
                        name="Amount"
                      />

                    </BarChart>
                  </ResponsiveContainer>

                </div>

              </div>

            </div>


            {/* ================================= */}
            {/* CATEGORY COUNTS */}
            {/* ================================= */}

            <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl mb-8">

              <h2 className="text-xl font-bold text-white mb-4">
                📋 Subscriptions by Category
              </h2>

              <div className="space-y-3">

                {Object.entries(
                  categoryCounts
                ).length > 0 ? (

                  Object.entries(
                    categoryCounts
                  ).map(
                    ([category, count]) => (

                      <div
                        key={category}
                        className="flex justify-between items-center bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3"
                      >

                        <span className="font-medium text-slate-300">
                          {category}
                        </span>

                        <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full text-sm">
                          {count} subscription
                          {count !== 1
                            ? "s"
                            : ""}
                        </span>

                      </div>

                    )
                  )

                ) : (

                  <p className="text-slate-500">
                    No subscription data available.
                  </p>

                )}

              </div>

            </div>


            {/* ================================= */}
            {/* REMINDERS */}
            {/* ================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-8">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

                <div>

                  <h2 className="text-xl font-bold text-white">
                    🔔 Reminders
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {unreadReminderCount > 0
                      ? `${unreadReminderCount} unread reminder${
                          unreadReminderCount !== 1
                            ? "s"
                            : ""
                        }`
                      : "All reminders have been read"}
                  </p>

                </div>

                {urgentReminderCount > 0 && (
                  <div className="inline-flex items-center self-start md:self-auto gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-semibold">
                    🚨 {urgentReminderCount} urgent
                  </div>
                )}

              </div>


              {reminders.length > 0 ? (

                <div className="space-y-4">

                  {reminders.map(
                    (reminder) => {

                      const reminderKey =
                        `${reminder.type}-${reminder.id}`;

                      const isRead =
                        readReminders.includes(
                          reminderKey
                        );

                      const priorityStyle =
                        getReminderPriority(
                          reminder.priority
                        );

                      const timeText =
                        getReminderTimeText(
                          reminder.days_remaining
                        );

                      return (

                        <div
                          key={reminderKey}
                          className={`border rounded-xl p-4 transition ${
                            isRead
                              ? "opacity-60 bg-slate-950/30 border-slate-800"
                              : "bg-slate-950/50 border-slate-800 hover:border-indigo-500/30"
                          }`}
                        >

                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                            <div className="flex-1">

                              <div className="flex flex-wrap items-center gap-2 mb-2">

                                <h3 className="font-semibold text-lg text-white">
                                  {
                                    reminder.service_name
                                  }
                                </h3>

                                <span
                                  className={`inline-flex items-center gap-1 border rounded-full px-3 py-1 text-xs font-bold ${priorityStyle.className}`}
                                >
                                  {
                                    priorityStyle.icon
                                  }{" "}
                                  {
                                    reminder.priority ||
                                    "Medium"
                                  }
                                </span>

                              </div>

                              <p className="text-slate-400">
                                {
                                  reminder.message
                                }
                              </p>

                              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">

                                <p className="text-slate-500 text-sm">
                                  📅{" "}
                                  {
                                    reminder.date
                                  }
                                </p>

                                <p className="text-slate-500 text-sm">
                                  📌{" "}
                                  {
                                    reminder.type
                                  }
                                </p>

                              </div>

                            </div>


                            <div className="lg:text-right">

                              <p className="font-bold text-lg text-white">
                                {
                                  reminder.currency
                                }{" "}
                                {
                                  reminder.amount
                                }
                              </p>

                              <p
                                className={`text-sm font-semibold mt-1 ${
                                  reminder.days_remaining <=
                                  1
                                    ? "text-red-400"
                                    : reminder.days_remaining <=
                                      3
                                    ? "text-orange-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                ⏰{" "}
                                {timeText}
                              </p>

                              <div className="mt-2">

                                {!isRead ? (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      markAsRead(
                                        reminderKey
                                      )
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-sm hover:bg-slate-700 transition"
                                  >
                                    Mark as Read
                                  </button>

                                ) : (

                                  <span className="text-sm text-green-400 font-semibold">
                                    ✓ Read
                                  </span>

                                )}

                              </div>

                            </div>

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              ) : (

                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">

                  <p className="text-green-300 font-medium">
                    🎉 No reminders at the moment.
                  </p>

                  <p className="text-green-400/70 text-sm mt-1">
                    You're all caught up!
                  </p>

                </div>

              )}

            </div>


            {/* ================================= */}
            {/* UPCOMING SUBSCRIPTION RENEWALS */}
            {/* ================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-8">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">

                <div>

                  <h2 className="text-xl font-bold text-white">
                    🔔 Upcoming Renewals
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Subscriptions renewing soon
                  </p>

                </div>

                <span className="text-sm text-slate-500 mt-1 md:mt-0">
                  Next 7 days
                </span>

              </div>


              {dashboard?.upcoming_subscriptions?.length >
              0 ? (

                <div className="space-y-4">

                  {dashboard.upcoming_subscriptions.map(
                    (subscription) => {

                      const renewalStatus =
                        getRenewalStatus(
                          subscription.days_remaining
                        );

                      return (

                        <div
                          key={subscription.id}
                          className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/30 transition"
                        >

                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                            <div>

                              <h3 className="font-semibold text-lg text-white">
                                {
                                  subscription.service_name
                                }
                              </h3>

                              <p className="text-slate-400 mt-1">
                                Renewal Date:{" "}
                                {
                                  subscription.renewal_date
                                }
                              </p>

                              <p className="text-slate-500 text-sm mt-1">
                                Billing:{" "}
                                {
                                  subscription.billing_cycle
                                }
                              </p>

                            </div>


                            <div className="md:text-right">

                              <p className="font-bold text-lg text-white">
                                {
                                  subscription.currency
                                }{" "}
                                {
                                  subscription.amount
                                }
                              </p>

                              <div
                                className={`inline-block border rounded-full px-3 py-1 mt-2 text-sm font-semibold ${renewalStatus.className}`}
                              >
                                {
                                  renewalStatus.text
                                }
                              </div>

                            </div>

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              ) : (

                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">

                  <p className="text-green-300">
                    🎉 No subscription renewals in the next 7 days.
                  </p>

                </div>

              )}

            </div>


            {/* ================================= */}
            {/* UPCOMING FREE TRIALS */}
            {/* ================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-8">

              <div className="mb-5">

                <h2 className="text-xl font-bold text-white">
                  ⏳ Free Trials Ending Soon
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Trials that may convert into paid subscriptions
                </p>

              </div>


              {dashboard?.upcoming_free_trials?.length >
              0 ? (

                <div className="space-y-4">

                  {dashboard.upcoming_free_trials.map(
                    (trial) => (

                      <div
                        key={trial.id}
                        className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/30 transition"
                      >

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

                          <div>

                            <h3 className="font-bold text-lg text-white">
                              {
                                trial.service_name
                              }
                            </h3>

                            <p className="text-slate-400 mt-1">
                              Trial ends:{" "}
                              {trial.end_date}
                            </p>

                            <p className="text-red-400 font-medium mt-1">

                              {trial.days_remaining ===
                              0
                                ? "Ends today!"
                                : `${trial.days_remaining} days remaining`}

                            </p>

                          </div>


                          <div className="sm:text-right">

                            <p className="text-xl font-bold text-white">
                              ₹
                              {
                                trial.amount_after_trial
                              }
                            </p>

                            <p className="text-slate-500 text-sm">
                              After trial
                            </p>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">

                  <p className="text-green-300">
                    🎉 No free trials ending in the next 7 days.
                  </p>

                </div>

              )}

            </div>

          </>
        )}

      </div>

    </div>
  );
}

export default Dashboard;