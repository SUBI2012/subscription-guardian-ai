import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import api from "../api/axios";

function Analytics() {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ========================================
  // FETCH ANALYTICS DATA
  // ========================================

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/dashboard/");

      console.log(
        "Analytics dashboard data:",
        response.data
      );

      setDashboard(response.data);

    } catch (error) {
      console.error(
        "Analytics error:",
        error
      );

      if (error.response) {
        setError(
          error.response.data.detail ||
            "Unable to load analytics."
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

  // ========================================
  // LOAD DATA
  // ========================================

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ========================================
  // CONVERT CATEGORY SPENDING OBJECT
  // INTO CHART ARRAY
  // ========================================

  const categorySpending =
    dashboard?.category_spending || {};

  const categorySpendingData =
    Object.entries(
      categorySpending
    ).map(([category, amount]) => ({
      category,
      amount: Number(amount),
    }));

  // ========================================
  // CONVERT CATEGORY COUNTS OBJECT
  // INTO ARRAY
  // ========================================

  const categoryCounts =
    dashboard?.category_counts || {};

  const categoryCountData =
    Object.entries(
      categoryCounts
    ).map(([category, count]) => ({
      category,
      count: Number(count),
    }));

  // ========================================
  // MONTHLY / YEARLY SPENDING
  // ========================================

  const spendingData = [
    {
      name: "Monthly",
      amount: Number(
        dashboard?.monthly_spending || 0
      ),
    },
    {
      name: "Yearly",
      amount: Number(
        dashboard?.yearly_spending || 0
      ),
    },
  ];

  // ========================================
  // SUMMARY VALUES
  // ========================================

  const monthlySpending =
    Number(
      dashboard?.monthly_spending || 0
    );

  const yearlySpending =
    Number(
      dashboard?.yearly_spending || 0
    );

  const totalSubscriptions =
    Number(
      dashboard?.active_subscriptions || 0
    );

  const upcomingSubscriptions =
    dashboard?.upcoming_subscriptions
      ?.length || 0;

  const upcomingFreeTrials =
    dashboard?.upcoming_free_trials
      ?.length || 0;

  const upcomingTotal =
    upcomingSubscriptions +
    upcomingFreeTrials;

  // ========================================
  // HIGHEST SPENDING CATEGORY
  // ========================================

  let highestCategory = "None";

  let highestCategoryAmount = 0;

  if (
    categorySpendingData.length > 0
  ) {
    const highest =
      categorySpendingData.reduce(
        (previous, current) =>
          current.amount >
          previous.amount
            ? current
            : previous
      );

    highestCategory =
      highest.category;

    highestCategoryAmount =
      highest.amount;
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">

        <div className="max-w-7xl mx-auto">

          <h1 className="text-3xl font-bold">
            Analytics
          </h1>

          <p className="text-slate-400 mt-2">
            Loading your subscription analytics...
          </p>

        </div>

      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">

        <div className="max-w-7xl mx-auto">

          <h1 className="text-3xl font-bold">
            Analytics
          </h1>

          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-5">

            <p className="text-red-400">
              {error}
            </p>

            <button
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition"
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">

      <div className="max-w-7xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Analytics
          </h1>

          <p className="text-slate-400 mt-2">
            Understand where your subscription
            money is going.
          </p>

        </div>

        {/* ================================= */}
        {/* SUMMARY CARDS */}
        {/* ================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* MONTHLY */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-sm text-slate-400">
              💰 Monthly Spending
            </p>

            <p className="text-3xl font-bold text-white mt-2">

              ₹
              {monthlySpending.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 2,
                }
              )}

            </p>

            <p className="text-xs text-slate-500 mt-2">
              Estimated monthly cost
            </p>

          </div>

          {/* YEARLY */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-sm text-slate-400">
              📅 Yearly Spending
            </p>

            <p className="text-3xl font-bold text-white mt-2">

              ₹
              {yearlySpending.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 2,
                }
              )}

            </p>

            <p className="text-xs text-slate-500 mt-2">
              Estimated yearly cost
            </p>

          </div>

          {/* ACTIVE SUBSCRIPTIONS */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-sm text-slate-400">
              🔄 Active Subscriptions
            </p>

            <p className="text-3xl font-bold text-white mt-2">
              {totalSubscriptions}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Currently active
            </p>

          </div>

          {/* UPCOMING */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-sm text-slate-400">
              ⚠️ Upcoming
            </p>

            <p className="text-3xl font-bold text-white mt-2">
              {upcomingTotal}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Renewals and trials in next 7 days
            </p>

          </div>

        </div>

        {/* ================================= */}
        {/* CHARTS */}
        {/* ================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CATEGORY PIE CHART */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h2 className="text-lg font-semibold">
              📊 Spending by Category
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Distribution of your subscription
              spending.
            </p>

            <div className="h-80 mt-4">

              {categorySpendingData.length ===
              0 ? (

                <div className="h-full flex items-center justify-center text-slate-500">
                  No category spending data yet.
                </div>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={
                        categorySpendingData
                      }
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >

                      {categorySpendingData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              )}

            </div>

          </div>

          {/* BAR CHART */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h2 className="text-lg font-semibold">
              📈 Spending Overview
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Monthly versus yearly spending.
            </p>

            <div className="h-80 mt-4">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={spendingData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    stroke="#94a3b8"
                  />

                  <Tooltip />

                  <Bar
                    dataKey="amount"
                    name="Amount"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        {/* ================================= */}
        {/* CATEGORY COUNTS */}
        {/* ================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">

          <h2 className="text-lg font-semibold">
            📋 Subscriptions by Category
          </h2>

          <p className="text-sm text-slate-500 mt-1 mb-6">
            Number of active subscriptions
            in each category.
          </p>

          {categoryCountData.length ===
          0 ? (

            <p className="text-slate-500">
              No category data available yet.
            </p>

          ) : (

            <div className="space-y-4">

              {categoryCountData.map(
                (item) => (

                  <div
                    key={item.category}
                    className="flex items-center justify-between bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3"
                  >

                    <span className="text-slate-300">
                      {item.category}
                    </span>

                    <span className="font-semibold text-white">
                      {item.count}{" "}
                      {item.count === 1
                        ? "subscription"
                        : "subscriptions"}
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* ================================= */}
        {/* SPENDING INSIGHT */}
        {/* ================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">

          <h2 className="text-lg font-semibold">
            💡 Spending Insight
          </h2>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="bg-slate-800/60 rounded-xl p-4">

              <p className="text-sm text-slate-400">
                Highest Spending Category
              </p>

              <p className="text-xl font-bold mt-2">
                {highestCategory}
              </p>

              <p className="text-sm text-slate-500 mt-1">

                ₹
                {highestCategoryAmount.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}

              </p>

            </div>

            <div className="bg-slate-800/60 rounded-xl p-4">

              <p className="text-sm text-slate-400">
                Upcoming Items
              </p>

              <p className="text-xl font-bold mt-2">
                {upcomingTotal}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Within the next 7 days
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Analytics;