"use client";

import { useEffect, useState } from "react";

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

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
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
