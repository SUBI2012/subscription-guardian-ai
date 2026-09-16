import { useEffect, useState } from "react";
import api from "../api/axios";

const initialProfile = {
  name: "",
  email: "",
};

const initialNotifications = {
  emailReminders: true,
  renewalAlerts: true,
  smsAlerts: false,
  whatsappAlerts: false,
};

const initialReminderTiming = {
  sevenDays: true,
  threeDays: true,
  oneDay: true,
};

const initialPasswords = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

const NOTIFICATION_FIELDS = [
  {
    key: "emailReminders",
    label: "Email reminders",
  },
  {
    key: "renewalAlerts",
    label: "Renewal alerts",
  },
  {
    key: "smsAlerts",
    label: "SMS alerts",
  },
  {
    key: "whatsappAlerts",
    label: "WhatsApp alerts",
  },
];

const REMINDER_TIMING_FIELDS = [
  {
    key: "sevenDays",
    label: "7 days before",
  },
  {
    key: "threeDays",
    label: "3 days before",
  },
  {
    key: "oneDay",
    label: "1 day before",
  },
];

function SectionHeader({ title }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      <div className="h-px bg-slate-800 mt-3" />
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}) {
  return (
    <label className="flex items-center gap-3 py-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-indigo-500 cursor-pointer"
      />

      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
}

function Settings() {
  const [profile, setProfile] =
    useState(initialProfile);

  const [notifications, setNotifications] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "notificationPreferences"
          );

        return saved
          ? {
              ...initialNotifications,
              ...JSON.parse(saved),
            }
          : initialNotifications;
      } catch {
        return initialNotifications;
      }
    });

  const [reminderTiming, setReminderTiming] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "reminderTimingPreferences"
          );

        return saved
          ? {
              ...initialReminderTiming,
              ...JSON.parse(saved),
            }
          : initialReminderTiming;
      } catch {
        return initialReminderTiming;
      }
    });

  const [passwords, setPasswords] =
    useState(initialPasswords);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  // Save notification preferences whenever they change
  useEffect(() => {
    localStorage.setItem(
      "notificationPreferences",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  // Save reminder timing whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "reminderTimingPreferences",
      JSON.stringify(reminderTiming)
    );
  }, [reminderTiming]);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/profile/");

      console.log(
        "Profile:",
        response.data
      );

      setProfile({
        name:
          response.data.name || "",
        email:
          response.data.email || "",
      });
    } catch (error) {
      console.error(
        "Error loading profile:",
        error
      );

      if (error.response) {
        setError(
          error.response.data.detail ||
            "Unable to load your profile."
        );
      } else {
        setError(
          "Cannot connect to the backend."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleNotification(key) {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  }

  function toggleReminderTiming(key) {
    setReminderTiming((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  }

  function handlePasswordChange(e) {
    setPasswords((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSaveProfile() {
    setMessage("");
    setError("");

    if (!profile.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (!profile.email.trim()) {
      setError("Email cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      const response =
        await api.put(
          "/profile/",
          {
            name: profile.name.trim(),
            email: profile.email.trim(),
          }
        );

      console.log(
        "Updated profile:",
        response.data
      );

      setProfile({
        name:
          response.data.name || "",
        email:
          response.data.email || "",
      });

      setMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Error saving profile:",
        error
      );

      if (error.response) {
        setError(
          error.response.data.detail ||
            "Failed to update profile."
        );
      } else {
        setError(
          "Cannot connect to the backend."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setPasswordMessage("");
    setPasswordError("");

    if (!passwords.current_password) {
      setPasswordError(
        "Please enter your current password."
      );
      return;
    }

    if (!passwords.new_password) {
      setPasswordError(
        "Please enter a new password."
      );
      return;
    }

    if (passwords.new_password.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (
      passwords.new_password !==
      passwords.confirm_password
    ) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    if (
      passwords.current_password ===
      passwords.new_password
    ) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response =
        await api.put(
          "/profile/change-password",
          passwords
        );

      console.log(
        "Password response:",
        response.data
      );

      setPasswordMessage(
        response.data.message ||
          "Password changed successfully."
      );

      setPasswords({
        ...initialPasswords,
      });
    } catch (error) {
      console.error(
        "Error changing password:",
        error
      );

      if (error.response) {
        setPasswordError(
          error.response.data.detail ||
            "Failed to change password."
        );
      } else {
        setPasswordError(
          "Cannot connect to the backend."
        );
      }
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8">

      <div className="max-w-3xl mx-auto">

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            Settings
          </h1>

          <p className="text-slate-400 mt-2">
            Manage your profile, security
            and notification preferences.
          </p>
        </header>

        {loading && (
          <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-300">
            Loading your profile...
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-950/40 border border-red-800 rounded-xl p-4 text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 bg-emerald-950/40 border border-emerald-800 rounded-xl p-4 text-emerald-300">
            ✓ {message}
          </div>
        )}

        <div className="space-y-8">

          {/* PROFILE */}

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <SectionHeader title="Profile" />

            <div className="space-y-5">

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm text-slate-300 mb-1.5"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      name: e.target.value,
                    })
                  }
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-slate-300 mb-1.5"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value,
                    })
                  }
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving || loading}
                className="px-6 py-2.5 rounded-xl text-sm font-medium bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? "Saving..."
                  : "Save Profile"}
              </button>

            </div>
          </section>


          {/* SECURITY */}

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <SectionHeader title="Security" />

            <div className="space-y-5">

              {passwordError && (
                <div className="bg-red-950/40 border border-red-800 rounded-xl p-4 text-sm text-red-300">
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="bg-emerald-950/40 border border-emerald-800 rounded-xl p-4 text-sm text-emerald-300">
                  ✓ {passwordMessage}
                </div>
              )}

              <div>
                <label
                  htmlFor="current_password"
                  className="block text-sm text-slate-300 mb-1.5"
                >
                  Current Password
                </label>

                <input
                  id="current_password"
                  name="current_password"
                  type="password"
                  value={
                    passwords.current_password
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter current password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="new_password"
                  className="block text-sm text-slate-300 mb-1.5"
                >
                  New Password
                </label>

                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={
                    passwords.new_password
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="At least 8 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm text-slate-300 mb-1.5"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={
                    passwords.confirm_password
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="px-6 py-2.5 rounded-xl text-sm font-medium bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </button>

            </div>
          </section>


          {/* NOTIFICATIONS */}

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <SectionHeader
              title="Notification Preferences"
            />

            <p className="text-sm text-slate-500 mb-4">
              Choose how you would like to
              receive subscription alerts.
            </p>

            <div className="divide-y divide-slate-800/60">

              {NOTIFICATION_FIELDS.map(
                (field) => (
                  <Checkbox
                    key={field.key}
                    label={field.label}
                    checked={
                      notifications[
                        field.key
                      ]
                    }
                    onChange={() =>
                      toggleNotification(
                        field.key
                      )
                    }
                  />
                )
              )}

            </div>

            <p className="text-xs text-emerald-500 mt-4">
              ✓ Preferences are automatically
              saved on this device.
            </p>

          </section>


          {/* REMINDER TIMING */}

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <SectionHeader
              title="Reminder Timing"
            />

            <p className="text-sm text-slate-500 mb-4">
              Choose when you want to be
              reminded about upcoming renewals.
            </p>

            <div className="divide-y divide-slate-800/60">

              {REMINDER_TIMING_FIELDS.map(
                (field) => (
                  <Checkbox
                    key={field.key}
                    label={field.label}
                    checked={
                      reminderTiming[
                        field.key
                      ]
                    }
                    onChange={() =>
                      toggleReminderTiming(
                        field.key
                      )
                    }
                  />
                )
              )}

            </div>

            <p className="text-xs text-emerald-500 mt-4">
              ✓ Reminder timing is automatically
              saved on this device.
            </p>

          </section>

        </div>
      </div>
    </div>
  );
}

export default Settings;