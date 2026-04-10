"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  client: {
    businessName: string;
    apiKey: string;
    plan: string;
    isActive: boolean;
    usageThisMonth: number;
    monthlyLimit: number;
    agentName: string;
    welcomeMessage: string;
    brandColor: string;
  };
  leadsCount: number;
  conversationsCount: number;
  recentLeads: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
  }>;
}

export default function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;
  }

  if (!data) return <div className="text-red-500">Failed to load dashboard</div>;

  const widgetCode = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-api-key="${data.client.apiKey}"></script>`;

  const copyWidget = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const usagePercent = Math.min(100, Math.round((data.client.usageThisMonth / data.client.monthlyLimit) * 100));

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
      <p className="text-gray-500 mb-8">{data.client.businessName} - {data.client.plan.charAt(0).toUpperCase() + data.client.plan.slice(1)} Plan</p>

      {!data.client.isActive && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8">
          Your account is currently deactivated. Please contact support or update your payment to reactivate.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">Total Leads</div>
          <div className="text-3xl font-bold text-brand-700">{data.leadsCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">Conversations</div>
          <div className="text-3xl font-bold text-purple-700">{data.conversationsCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">Monthly Usage</div>
          <div className="text-3xl font-bold text-orange-700">{data.client.usageThisMonth} / {data.client.monthlyLimit >= 999999 ? "Unlimited" : data.client.monthlyLimit.toLocaleString()}</div>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
            <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${usagePercent}%` }} />
          </div>
        </div>
      </div>

      {/* Widget Install Code */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-bold mb-2">Install Your AI Chat Widget</h2>
        <p className="text-gray-500 text-sm mb-4">
          Copy this code and paste it before the closing &lt;/body&gt; tag on your website.
        </p>
        <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between gap-4">
          <code className="text-green-400 text-sm break-all">{widgetCode}</code>
          <button
            onClick={copyWidget}
            className="flex-shrink-0 bg-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Leads</h2>
          <a href="/dashboard/leads" className="text-brand-600 text-sm hover:underline">View all</a>
        </div>
        <div className="divide-y">
          {data.recentLeads.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No leads yet. Install your widget to start capturing leads!</div>
          ) : (
            data.recentLeads.map((lead) => (
              <div key={lead.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{lead.name || "Unknown Visitor"}</div>
                  <div className="text-sm text-gray-400">{lead.email || "No email"}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs capitalize">{lead.status}</span>
                  <span className="text-sm text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
