"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  budget: string;
  location: string;
  propertyType: string;
  notes: string;
  score: number;
  temperature: string;
  scoreReason: string;
  timeline: string;
  preApproved: boolean;
  createdAt: string;
}

const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
  qualified: "bg-purple-50 text-purple-700 border-purple-200",
  converted: "bg-green-50 text-green-700 border-green-200",
  lost: "bg-gray-50 text-gray-600 border-gray-200",
};

const TEMP_STYLES: Record<string, { bg: string; dot: string; label: string }> = {
  hot: { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", label: "HOT" },
  warm: { bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", label: "WARM" },
  cold: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400", label: "COLD" },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [tempFilter, setTempFilter] = useState("all");

  const loadLeads = () => {
    fetch("/api/dashboard/leads")
      .then((r) => r.json())
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLeads(); }, []);

  const updateStatus = async (leadId: string, status: string) => {
    await fetch(`/api/dashboard/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadLeads();
  };

  const exportLeads = () => {
    window.open("/api/dashboard/leads/export", "_blank");
  };

  let filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);
  if (tempFilter !== "all") filtered = filtered.filter((l) => l.temperature === tempFilter);
  filtered.sort((a, b) => b.score - a.score);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
        <div className="text-sm text-gray-500">Loading leads...</div>
      </div>
    );
  }

  const hotCount = leads.filter((l) => l.temperature === "hot").length;
  const warmCount = leads.filter((l) => l.temperature === "warm").length;
  const coldCount = leads.filter((l) => l.temperature === "cold").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-1">
            Leads
          </h1>
          <p className="text-gray-500">
            {leads.length} total leads captured by your AI · sorted by score (hottest first)
          </p>
        </div>
        <button
          onClick={exportLeads}
          className="group inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:border-gray-300 hover:shadow-sm transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Temperature stat cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "HOT", count: hotCount, gradient: "from-red-500 to-orange-500", icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.24 17 7.997c0 0-.342-1.5-2-4 1 0 2-.5 5.4 4.797C21.42 12.23 20.84 18 17.657 18.657zM9.879 16.121A3 3 0 1112.015 11L11 14H9c0 .768.293 1.536.879 2.121z" },
          { label: "WARM", count: warmCount, gradient: "from-orange-500 to-yellow-500", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" },
          { label: "COLD", count: coldCount, gradient: "from-blue-500 to-cyan-500", icon: "M20 11H4m16 0l-4-4m4 4l-4 4M4 13h16m0 0l-4 4m4-4l-4-4" },
        ].map((t) => (
          <div key={t.label} className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 hover:shadow-premium hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${t.gradient} opacity-10 blur-2xl`}></div>
            <div className="relative">
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${t.gradient} text-white mb-2`}>
                {t.label}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{t.count}</div>
              <div className="text-xs text-gray-500 mt-0.5">leads</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Temperature</span>
          {["all", "hot", "warm", "cold"].map((t) => (
            <button
              key={t}
              onClick={() => setTempFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                tempFilter === t
                  ? "gradient-brand text-white shadow-md shadow-blue-500/20"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Status</span>
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === s
                  ? "gradient-brand text-white shadow-md shadow-blue-500/20"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s} <span className="opacity-60">({s === "all" ? leads.length : leads.filter((l) => l.status === s).length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leads grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((lead) => {
          const temp = TEMP_STYLES[lead.temperature] || TEMP_STYLES.cold;
          const statusStyle = STATUS_STYLES[lead.status] || STATUS_STYLES.new;
          return (
            <div
              key={lead.id}
              className="group bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-premium hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md shadow-blue-500/20">
                  {(lead.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{lead.name || "Unknown Visitor"}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                {lead.score > 0 && (
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${temp.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${temp.dot}`}></span>
                    {lead.score}/10
                  </div>
                )}
              </div>

              <div className="mb-4">
                <select
                  value={lead.status}
                  onChange={(e) => updateStatus(lead.id, e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-semibold border capitalize cursor-pointer ${statusStyle}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-sm">
                {lead.email && (
                  <div className="flex items-center gap-2 text-gray-600 min-w-0">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{lead.phone}</span>
                  </div>
                )}
                {lead.budget && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{lead.budget}</span>
                  </div>
                )}
                {lead.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{lead.location}</span>
                  </div>
                )}
                {lead.propertyType && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{lead.propertyType}</span>
                  </div>
                )}
                {lead.timeline && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{lead.timeline}</span>
                  </div>
                )}
                {lead.preApproved && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold border border-green-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Pre-Approved
                  </div>
                )}
              </div>

              {lead.scoreReason && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                  <div className="text-xs text-gray-500 italic leading-relaxed">{lead.scoreReason}</div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No leads match this filter</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or wait for new leads to come in.</p>
          </div>
        )}
      </div>
    </div>
  );
}
