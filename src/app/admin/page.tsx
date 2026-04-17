"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WhatsNew from "@/components/WhatsNew";

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
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
        <div className="text-sm text-gray-500">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!stats) return <div className="text-red-500">Failed to load stats</div>;

  const cards = [
    {
      label: "Total Clients",
      value: stats.totalClients.toLocaleString("en-US"),
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Active Clients",
      value: stats.activeClients.toLocaleString("en-US"),
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      label: "Total Leads",
      value: stats.totalLeads.toLocaleString("en-US"),
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Conversations",
      value: stats.totalConversations.toLocaleString("en-US"),
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-1">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">Overview of your CloserAI business</p>
      </div>

      {/* What's New - broadcast system */}
      <WhatsNew compact={true} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="group relative bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-premium hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${c.gradient} opacity-10 blur-2xl`}></div>
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg mb-3`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} />
                </svg>
              </div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{c.label}</div>
              <div className="text-3xl font-bold text-gray-900 tracking-tight">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue card */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-premium-lg" style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)" }}>
        <div className="absolute inset-0 bg-grid-dark opacity-20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Estimated Monthly Revenue
            </div>
          </div>
          <div className="text-5xl sm:text-6xl font-bold tracking-tight mb-2">
            ${stats.monthlyRevenue.toLocaleString("en-US")}
            <span className="text-xl text-white/70 font-normal">/mo</span>
          </div>
          <p className="text-sm text-white/80">Based on active subscriptions across all plans</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Activity</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {unreadCount > 0 ? (
                <span className="text-red-600 font-semibold inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  All caught up
                </span>
              )}
            </p>
          </div>
          <Link
            href="/admin/notifications"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No activity yet</h3>
              <p className="text-sm text-gray-500">You&apos;ll see trial signups and payments here.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const icons: Record<string, { emoji: string; bg: string }> = {
                trial_signup: { emoji: "🎯", bg: "bg-blue-100" },
                new_payment: { emoji: "💰", bg: "bg-green-100" },
                payment_failed: { emoji: "⚠️", bg: "bg-red-100" },
                trial_expired: { emoji: "⏰", bg: "bg-orange-100" },
                new_lead: { emoji: "👤", bg: "bg-purple-100" },
                subscription_cancelled: { emoji: "👋", bg: "bg-gray-100" },
              };
              const icon = icons[n.type] || { emoji: "🔔", bg: "bg-gray-100" };
              const now = new Date();
              const created = new Date(n.createdAt);
              const diffMin = Math.floor((now.getTime() - created.getTime()) / 60000);
              const timeAgo =
                diffMin < 1 ? "just now" : diffMin < 60 ? `${diffMin}m ago` : diffMin < 1440 ? `${Math.floor(diffMin / 60)}h ago` : `${Math.floor(diffMin / 1440)}d ago`;

              return (
                <div
                  key={n.id}
                  className={`px-6 py-4 flex items-start gap-3 transition ${!n.read ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${icon.bg} flex items-center justify-center text-xl flex-shrink-0`}>
                    {icon.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`font-semibold text-sm ${!n.read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</h3>
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Clients</h2>
            <p className="text-sm text-gray-500 mt-0.5">Latest signups across all plans</p>
          </div>
          <Link
            href="/admin/clients"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Business</th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Leads</th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                    No clients yet. First signups will appear here.
                  </td>
                </tr>
              ) : (
                stats.recentClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {client.businessName.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-semibold text-gray-900">{client.businessName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize border border-blue-100">
                        {client.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          client.isActive
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${client.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                        {client.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-semibold">{client.leadsCount}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(client.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
