"use client";

import { useEffect, useState } from "react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  read: boolean;
  createdAt: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  trial_signup: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "🎯" },
  new_payment: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "💰" },
  payment_failed: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "⚠️" },
  trial_expired: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "⏰" },
  new_lead: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "👤" },
  subscription_cancelled: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: "👋" },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/admin/notifications", { method: "POST" });
    loadNotifications();
  };

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount} unread · Auto-refreshes every 15 seconds
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="bg-brand-50 text-brand-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-100 transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "all" ? "gradient-brand text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "unread" ? "gradient-brand text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border py-16 px-6 text-center">
          <div className="text-5xl mb-3">🔔</div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No notifications yet</h3>
          <p className="text-sm text-gray-500">
            You&apos;ll be notified here when someone signs up for a trial or pays.
          </p>
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-3">
        {filtered.map((n) => {
          const style = TYPE_COLORS[n.type] || TYPE_COLORS.trial_signup;
          return (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border-2 p-5 transition ${
                !n.read ? `${style.border} shadow-md` : "border-gray-100"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className={`font-bold ${n.read ? "text-gray-700" : "text-gray-900"}`}>
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      )}
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{n.message}</p>

                  {Object.keys(n.metadata).length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {Object.entries(n.metadata).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium text-gray-500 min-w-[80px]">{key}:</span>
                            <span className="text-gray-700 truncate">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
