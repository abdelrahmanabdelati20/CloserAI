"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalClients: number;
  activeClients: number;
  totalLeads: number;
  totalConversations: number;
  monthlyRevenue: number;
  recentClients: Array<{
    id: string;
    businessName: string;
    plan: string;
    isActive: boolean;
    leadsCount: number;
    createdAt: string;
  }>;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/notifications").then((r) => r.json()),
    ])
      .then(([statsData, notifData]) => {
        setStats(statsData);
        setNotifications((notifData.notifications || []).slice(0, 5));
        setUnreadCount(notifData.unreadCount || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Auto-refresh notifications every 15 seconds
    const interval = setInterval(() => {
      fetch("/api/admin/notifications")
        .then((r) => r.json())
        .then((data) => {
          setNotifications((data.notifications || []).slice(0, 5));
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;
  }

  if (!stats) return <div className="text-red-500">Failed to load stats</div>;

  const cards = [
    { label: "Total Clients", value: stats.totalClients, color: "bg-blue-50 text-blue-700" },
    { label: "Active Clients", value: stats.activeClients, color: "bg-green-50 text-green-700" },
    { label: "Total Leads", value: stats.totalLeads, color: "bg-purple-50 text-purple-700" },
    { label: "Conversations", value: stats.totalConversations, color: "bg-orange-50 text-orange-700" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="text-sm text-gray-500 mb-1">{c.label}</div>
            <div className={`text-3xl font-bold ${c.color.split(" ")[1]}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Estimated Monthly Revenue */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-8">
        <div className="text-sm text-white/70 mb-1">Estimated Monthly Revenue</div>
        <div className="text-4xl font-bold">${stats.monthlyRevenue.toLocaleString()}/mo</div>
      </div>

      {/* Recent Activity / Notifications */}
      <div className="bg-white rounded-2xl shadow-sm border mb-8">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {unreadCount > 0 ? (
                <span className="text-red-600 font-semibold">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</span>
              ) : (
                "All caught up"
              )}
            </p>
          </div>
          <Link
            href="/admin/notifications"
            className="text-sm text-brand-600 hover:underline font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-gray-500">No activity yet. You&apos;ll see trial signups and payments here.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const icons: Record<string, string> = {
                trial_signup: "🎯",
                new_payment: "💰",
                payment_failed: "⚠️",
                trial_expired: "⏰",
                new_lead: "👤",
                subscription_cancelled: "👋",
              };
              const now = new Date();
              const created = new Date(n.createdAt);
              const diffMin = Math.floor((now.getTime() - created.getTime()) / 60000);
              const timeAgo = diffMin < 1 ? "just now" : diffMin < 60 ? `${diffMin}m ago` : diffMin < 1440 ? `${Math.floor(diffMin / 60)}h ago` : `${Math.floor(diffMin / 1440)}d ago`;

              return (
                <div key={n.id} className={`p-4 flex items-start gap-3 ${!n.read ? "bg-blue-50/30" : ""}`}>
                  <div className="text-2xl">{icons[n.type] || "🔔"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`font-semibold text-sm ${!n.read ? "text-gray-900" : "text-gray-700"}`}>
                        {n.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                        <span className="text-xs text-gray-400">{timeAgo}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Clients */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Clients</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Leads</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.recentClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{client.businessName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium capitalize">
                      {client.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {client.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{client.leadsCount}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
