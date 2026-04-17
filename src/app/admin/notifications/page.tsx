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

const TYPE_STYLES: Record<string, { bg: string; border: string; icon: string; iconBg: string }> = {
  trial_signup: { bg: "bg-blue-50/30", border: "border-blue-200", icon: "🎯", iconBg: "bg-blue-100" },
  new_payment: { bg: "bg-green-50/30", border: "border-green-200", icon: "💰", iconBg: "bg-green-100" },
  payment_failed: { bg: "bg-red-50/30", border: "border-red-200", icon: "⚠️", iconBg: "bg-red-100" },
  trial_expired: { bg: "bg-orange-50/30", border: "border-orange-200", icon: "⏰", iconBg: "bg-orange-100" },
  new_lead: { bg: "bg-purple-50/30", border: "border-purple-200", icon: "👤", iconBg: "bg-purple-100" },
  subscription_cancelled: { bg: "bg-gray-50/30", border: "border-gray-200", icon: "👋", iconBg: "bg-gray-100" },
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
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
    const interval = setInterval(loadNotifications, 15000);
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
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
        <div className="text-sm text-gray-500">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-1">
            Notifications
          </h1>
          <p className="text-gray-500 flex items-center gap-2">
            {unreadCount > 0 ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-200">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  {unreadCount} unread
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                All caught up
              </span>
            )}
            <span className="text-xs">· Auto-refreshes every 15s</span>
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:border-gray-300 hover:shadow-sm transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark all read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            filter === "all" ? "gradient-brand text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            filter === "unread" ? "gradient-brand text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="relative bg-white rounded-2xl border border-gray-200 py-20 px-6 text-center shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl rotate-6 opacity-20 animate-pulse"></div>
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shadow-lg shadow-blue-500/10">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === "unread" ? "All caught up!" : "No notifications yet"}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-5 leading-relaxed">
              {filter === "unread"
                ? "You've read every notification. Take a breath \u2014 new activity will appear here as soon as it happens."
                : "You'll get notified the moment someone starts a trial, upgrades a plan, or a new lead comes in. We poll every 15 seconds."}
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Monitoring in real-time
            </div>
          </div>
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-3">
        {filtered.map((n) => {
          const style = TYPE_STYLES[n.type] || TYPE_STYLES.trial_signup;
          return (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-premium ${
                !n.read ? `${style.border} ${style.bg}` : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className={`font-bold ${!n.read ? "text-gray-900" : "text-gray-700"}`}>
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
                      <span className="text-xs text-gray-400 whitespace-nowrap font-medium">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{n.message}</p>

                  {Object.keys(n.metadata).length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 mt-2 border border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                        {Object.entries(n.metadata).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-semibold text-gray-500 min-w-[80px] text-xs uppercase tracking-wider">{key}:</span>
                            <span className="text-gray-700 truncate text-xs">{String(value)}</span>
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
