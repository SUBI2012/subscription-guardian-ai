import { useEffect, useState } from "react";
import api from "../api/axios";

const DEFAULT_REMINDER_TIMING = {
  subscription: "7",
  freeTrial: "3",
};

function NotificationCenter() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [readIds, setReadIds] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          "readNotificationIds"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    } catch {
      return [];
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
              ...DEFAULT_REMINDER_TIMING,
              ...JSON.parse(saved),
            }
          : DEFAULT_REMINDER_TIMING;
      } catch {
        return DEFAULT_REMINDER_TIMING;
      }
    });

  useEffect(() => {
    fetchReminders();

    const interval = setInterval(() => {
      fetchReminders();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "readNotificationIds",
      JSON.stringify(readIds)
    );
  }, [readIds]);

  useEffect(() => {
    function handleStorageChange() {
      try {
        const saved =
          localStorage.getItem(
            "reminderTimingPreferences"
          );

        if (saved) {
          setReminderTiming({
            ...DEFAULT_REMINDER_TIMING,
            ...JSON.parse(saved),
          });
        }
      } catch (error) {
        console.error(
          "Error loading reminder timing:",
          error
        );
      }
    }

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  async function fetchReminders() {
    try {
      setLoading(true);

      const response =
        await api.get("/reminders/");

      setReminders(
        response.data.reminders || []
      );
    } catch (error) {
      console.error(
        "Error loading notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  function getNotificationId(reminder) {
    return `${reminder.type}-${reminder.id}`;
  }

  function isRead(reminder) {
    return readIds.includes(
      getNotificationId(reminder)
    );
  }

  function markAsRead(reminder) {
    const notificationId =
      getNotificationId(reminder);

    setReadIds((previous) => {
      if (previous.includes(notificationId)) {
        return previous;
      }

      return [
        ...previous,
        notificationId,
      ];
    });
  }

  function markAllAsRead() {
    const allIds = filteredReminders.map(
      (reminder) =>
        getNotificationId(reminder)
    );

    setReadIds((previous) => {
      return [
        ...new Set([
          ...previous,
          ...allIds,
        ]),
      ];
    });
  }

  function clearReadNotifications() {
    setReadIds((previous) => {
      return previous.filter((id) => {
        return !filteredReminders.some(
          (reminder) =>
            getNotificationId(reminder) === id
        );
      });
    });
  }

  function getPriorityStyle(priority) {
    if (priority === "Urgent") {
      return {
        badge:
          "bg-red-500/10 text-red-400 border-red-500/20",
        dot: "bg-red-400",
      };
    }

    if (priority === "High") {
      return {
        badge:
          "bg-orange-500/10 text-orange-400 border-orange-500/20",
        dot: "bg-orange-400",
      };
    }

    return {
      badge:
        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      dot: "bg-yellow-400",
    };
  }

  function getTimeText(reminder) {
    if (reminder.days_remaining === 0) {
      return "Today";
    }

    if (reminder.days_remaining === 1) {
      return "Tomorrow";
    }

    return `${reminder.days_remaining} days`;
  }

  function getAllowedDays(reminder) {
    if (reminder.type === "Subscription") {
      return Number(
        reminderTiming.subscription || 7
      );
    }

    if (reminder.type === "Free Trial") {
      return Number(
        reminderTiming.freeTrial || 3
      );
    }

    return 7;
  }

  const filteredReminders =
    reminders.filter((reminder) => {
      const allowedDays =
        getAllowedDays(reminder);

      return (
        reminder.days_remaining >= 0 &&
        reminder.days_remaining <= allowedDays
      );
    });

  const unreadCount =
    filteredReminders.filter(
      (reminder) => !isRead(reminder)
    ).length;

  const readCount =
    filteredReminders.filter(
      (reminder) => isRead(reminder)
    ).length;

  return (
    <div className="relative">

      {/* NOTIFICATION BUTTON */}

      <button
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        className="relative w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 flex items-center justify-center transition"
        aria-label="Notifications"
      >
        <span className="text-lg">
          🔔
        </span>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-slate-950">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>


      {/* NOTIFICATION PANEL */}

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-12 z-50 w-[380px] max-w-[calc(100vw-32px)] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

            {/* HEADER */}

            <div className="px-4 py-4 border-b border-slate-800">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="font-semibold text-white">
                    Notifications
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "You're all caught up"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchReminders}
                  disabled={loading}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center text-sm transition"
                  title="Refresh notifications"
                >
                  🔄
                </button>

              </div>


              {/* ACTIONS */}

              {filteredReminders.length > 0 && (
                <div className="flex items-center gap-3 mt-3">

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Mark all as read
                    </button>
                  )}

                  {readCount > 0 && (
                    <button
                      type="button"
                      onClick={clearReadNotifications}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Clear read
                    </button>
                  )}

                </div>
              )}

            </div>


            {/* LOADING */}

            {loading &&
              filteredReminders.length === 0 && (
                <div className="px-4 py-10 text-center">

                  <div className="text-2xl mb-3">
                    🔄
                  </div>

                  <p className="text-sm text-slate-400">
                    Loading notifications...
                  </p>

                </div>
              )}


            {/* EMPTY */}

            {!loading &&
              filteredReminders.length === 0 && (
                <div className="px-4 py-10 text-center">

                  <div className="text-4xl mb-3">
                    🎉
                  </div>

                  <p className="text-sm font-medium text-white">
                    No upcoming reminders
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    You're all caught up!
                  </p>

                </div>
              )}


            {/* NOTIFICATIONS */}

            {filteredReminders.length > 0 && (
              <div className="max-h-[420px] overflow-y-auto">

                {filteredReminders.map(
                  (reminder) => {
                    const read =
                      isRead(reminder);

                    const priorityStyle =
                      getPriorityStyle(
                        reminder.priority
                      );

                    return (
                      <button
                        key={getNotificationId(
                          reminder
                        )}
                        type="button"
                        onClick={() =>
                          markAsRead(
                            reminder
                          )
                        }
                        className={
                          "w-full text-left px-4 py-4 border-b border-slate-800/70 transition " +
                          (read
                            ? "bg-slate-900 hover:bg-slate-800/60"
                            : "bg-indigo-500/5 hover:bg-indigo-500/10")
                        }
                      >

                        <div className="flex gap-3">

                          <div className="pt-1.5">
                            <span
                              className={
                                "block w-2 h-2 rounded-full " +
                                (read
                                  ? "bg-slate-700"
                                  : priorityStyle.dot)
                              }
                            />
                          </div>

                          <div className="flex-1 min-w-0">

                            <div className="flex items-start justify-between gap-2">

                              <p
                                className={
                                  "text-sm truncate " +
                                  (read
                                    ? "text-slate-400"
                                    : "text-white font-medium")
                                }
                              >
                                {reminder.service_name}
                              </p>

                              <span
                                className={
                                  "shrink-0 text-[10px] px-2 py-0.5 rounded-full border " +
                                  priorityStyle.badge
                                }
                              >
                                {reminder.priority}
                              </span>

                            </div>

                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {reminder.message}
                            </p>

                            <div className="flex items-center gap-2 mt-2">

                              <span className="text-[11px] text-slate-600">
                                {reminder.type}
                              </span>

                              <span className="text-slate-700">
                                •
                              </span>

                              <span className="text-[11px] text-slate-500">
                                {getTimeText(
                                  reminder
                                )}
                              </span>

                            </div>

                          </div>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}

export default NotificationCenter;