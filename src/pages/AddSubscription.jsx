import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function AddSubscription() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    service_name: "",
    amount: "",
    currency: "INR",
    billing_cycle: "Monthly",
    subscription_type: "Paid",
    category: "",
    renewal_date: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.service_name.trim()) {
      setError("Please enter the service name.");
      return;
    }

    if (
      formData.amount === "" ||
      Number(formData.amount) < 0
    ) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!formData.renewal_date) {
      setError("Please select a renewal date.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/subscriptions/",
        {
          service_name:
            formData.service_name.trim(),

          amount: Number(formData.amount),

          currency:
            formData.currency,

          billing_cycle:
            formData.billing_cycle,

          subscription_type:
            formData.subscription_type,

          category:
            formData.category.trim() ||
            "Other",

          renewal_date:
            formData.renewal_date,
        }
      );

      console.log(
        "Subscription created:",
        response.data
      );

      setMessage(
        "Subscription added successfully! 🎉"
      );

      setTimeout(() => {
        navigate("/subscriptions");
      }, 800);

    } catch (error) {
      console.error(
        "Add subscription error:",
        error
      );

      if (error.response) {
        setError(
          error.response.data.detail ||
            "Failed to add subscription."
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

  return (
    <div className="min-h-screen bg-slate-950 p-8">

      <div className="max-w-2xl mx-auto">

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-white">
            Add Subscription
          </h1>

          <p className="text-slate-400 mt-2">
            Add a subscription to your
            Subscription Guardian account.
          </p>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8"
        >

          {/* Service Name */}

          <label className="text-sm text-slate-300">
            Service Name
          </label>

          <input
            type="text"
            name="service_name"
            placeholder="Netflix"
            value={formData.service_name}
            onChange={handleChange}
            required
            className="w-full mt-2 mb-5 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />

          {/* Amount */}

          <label className="text-sm text-slate-300">
            Amount
          </label>

          <input
            type="number"
            name="amount"
            placeholder="649"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
            className="w-full mt-2 mb-5 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />

          {/* Currency */}

          <label className="text-sm text-slate-300">
            Currency
          </label>

          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full mt-2 mb-5 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
          >
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

          {/* Billing Cycle */}

          <label className="text-sm text-slate-300">
            Billing Cycle
          </label>

          <select
            name="billing_cycle"
            value={formData.billing_cycle}
            onChange={handleChange}
            className="w-full mt-2 mb-5 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
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

          {/* Subscription Type */}

          <label className="text-sm text-slate-300">
            Subscription Type
          </label>

          <select
            name="subscription_type"
            value={formData.subscription_type}
            onChange={handleChange}
            className="w-full mt-2 mb-5 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
          >
            <option value="Paid">
              Paid
            </option>

            <option value="Free Trial">
              Free Trial
            </option>
          </select>

          {/* Category */}

          <label className="text-sm text-slate-300">
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full mt-2 mb-5 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
          >
            <option value="">
              Select Category
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

          {/* Renewal Date */}

          <label className="text-sm text-slate-300">
            Renewal Date
          </label>

          <input
            type="date"
            name="renewal_date"
            value={formData.renewal_date}
            onChange={handleChange}
            required
            className="w-full mt-2 mb-6 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
          />

          {/* Submit Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
          >
            {loading
              ? "Adding Subscription..."
              : "Add Subscription"}
          </button>

          {/* Success Message */}

          {message && (
            <p className="text-green-400 text-center mt-5">
              {message}
            </p>
          )}

          {/* Error Message */}

          {error && (
            <p className="text-red-400 text-center mt-5">
              {error}
            </p>
          )}

        </form>

      </div>

    </div>
  );
}

export default AddSubscription;