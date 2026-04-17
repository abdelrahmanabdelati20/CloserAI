"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WhatsNew from "@/components/WhatsNew";

interface DashboardData {
  client: {
    businessName: string;
    widgetId: string;
    apiKey: string;
    plan: string;
    isActive: boolean;
    usageThisMonth: number;
    monthlyLimit: number;
    agentName: string;
    welcomeMessage: string;
    brandColor: string;
    paypalStatus: string;
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
  analytics?: {
    hotLeads: number;
    warmLeads: number;
    coldLeads: number;
    convertedLeads: number;
    conversionRate: number;
    last7daysLeads: number;
    last30daysLeads: number;
  };
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
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
        <div className="text-sm text-gray-500">Loading your dashboard...</div>
      </div>
    );
  }

  if (!data) return <div className="text-red-500">Failed to load dashboard</div>;

  const widgetCode = `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js" data-api-key="${data.client.apiKey}"></script>`;

  const copyWidget = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const usagePercent = Math.min(100, Math.round((data.client.usageThisMonth / data.client.monthlyLimit) * 100));
  const usageColor = usagePercent < 60 ? "from-green-500 to-emerald-500" : usagePercent < 85 ? "from-yellow-500 to-orange-500" : "from-orange-500 to-red-500";

  const stats = [
    {
      label: "Total Leads",
      value: data.leadsCount.toLocaleString("en-US"),
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
      gradient: "from-blue-500 to-cyan-500",
      change: "+12% this week",
    },
    {
      label: "Conversations",
      value: data.conversationsCount.toLocaleString("en-US"),
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      gradient: "from-purple-500 to-pink-500",
      change: "All time",
    },
    {
      label: "Monthly Usage",
      value: `${data.client.usageThisMonth.toLocaleString("en-US")} / ${data.client.monthlyLimit >= 999999 ? "∞" : data.client.monthlyLimit.toLocaleString("en-US")}`,
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      gradient: usageColor,
      change: `${usagePercent}% used`,
      progress: usagePercent,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-1">
            Welcome back 👋
          </h1>
          <p className="text-gray-500">
            {data.client.businessName} ·{" "}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize">
              {data.client.plan}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${data.client.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${data.client.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
            {data.client.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      {!data.client.isActive && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-semibold">Account Deactivated</div>
            <div className="text-sm mt-0.5">Please contact support or update your payment to reactivate your AI widget.</div>
          </div>
        </div>
      )}

      {/* What's New - client update notifications */}
      <WhatsNew compact={true} />

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-premium hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 blur-2xl`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                  </svg>
                </div>
                <div className="text-xs text-gray-400 font-medium">{s.change}</div>
              </div>
              <div className="text-sm text-gray-500 font-medium mb-1">{s.label}</div>
              <div className="text-3xl font-bold text-gray-900 tracking-tight">{s.value}</div>
              {s.progress !== undefined && (
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${s.gradient} h-1.5 rounded-full transition-all`}
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Analytics — Pro/Enterprise */}
      {data.analytics && (data.client.plan === "professional" || data.client.plan === "enterprise") && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics & Reports
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{data.analytics.hotLeads}</div>
              <div className="text-xs text-red-600 font-semibold mt-1">Hot Leads</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{data.analytics.warmLeads}</div>
              <div className="text-xs text-orange-600 font-semibold mt-1">Warm Leads</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{data.analytics.conversionRate}%</div>
              <div className="text-xs text-green-600 font-semibold mt-1">Conversion Rate</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{data.analytics.last7daysLeads}</div>
              <div className="text-xs text-blue-600 font-semibold mt-1">Last 7 Days</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-700">{data.analytics.last30daysLeads}</div>
              <div className="text-xs text-gray-500">Last 30 days</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-700">{data.analytics.convertedLeads}</div>
              <div className="text-xs text-gray-500">Converted</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-700">{data.analytics.coldLeads}</div>
              <div className="text-xs text-gray-500">Cold leads</div>
            </div>
          </div>
        </div>
      )}

      {/* Widget Install Code */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Install Your AI Chat Widget</h2>
            <p className="text-gray-500 text-sm mt-1">
              Copy this code and paste it right before the closing <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">&lt;/body&gt;</code> tag on your website.
            </p>
          </div>
        </div>

        <div className="bg-gray-950 rounded-2xl overflow-hidden shadow-premium-lg">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
              <span className="text-xs text-gray-400 ml-2 font-mono">index.html</span>
            </div>
            <button
              onClick={copyWidget}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                copied
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-5 font-mono text-xs sm:text-sm overflow-x-auto">
            <code className="text-gray-300 break-all">
              <span className="text-pink-400">&lt;script</span>{" "}
              <span className="text-blue-400">src</span>
              <span className="text-gray-500">=</span>
              <span className="text-green-400">&quot;{typeof window !== "undefined" ? window.location.origin : ""}/widget.js&quot;</span>{" "}
              <span className="text-blue-400">data-api-key</span>
              <span className="text-gray-500">=</span>
              <span className="text-green-400">&quot;{data.client.apiKey}&quot;</span>
              <span className="text-pink-400">&gt;&lt;/script&gt;</span>
            </code>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            Works on WordPress, Wix, Squarespace, Webflow, custom HTML — any website. Your AI goes live within 60 seconds of installation.
          </div>
        </div>

        {/* Widget ID and API endpoint info */}
        {data.client.widgetId && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-semibold text-gray-500">Widget ID:</span>
                <code className="text-xs font-mono text-gray-900">{data.client.widgetId}</code>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-semibold text-gray-500">Config API:</span>
                <code className="text-xs font-mono text-blue-600 break-all">{typeof window !== "undefined" ? window.location.origin : ""}/api/widget/{data.client.widgetId}</code>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Use the Config API endpoint to programmatically check your widget status and configuration.</p>
          </div>
        )}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Leads</h2>
            <p className="text-sm text-gray-500 mt-0.5">Most recent captures from your widget</p>
          </div>
          <Link
            href="/dashboard/leads"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {data.recentLeads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No leads yet</h3>
              <p className="text-sm text-gray-500">Install your widget above to start capturing leads automatically.</p>
            </div>
          ) : (
            data.recentLeads.map((lead) => (
              <div key={lead.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(lead.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 truncate">{lead.name || "Unknown Visitor"}</div>
                    <div className="text-sm text-gray-500 truncate">{lead.email || "No email captured"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize border border-blue-100">
                    {lead.status}
                  </span>
                  <span className="hidden sm:block text-sm text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
