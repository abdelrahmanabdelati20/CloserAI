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
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-yellow-50 text-yellow-700",
  qualified: "bg-purple-50 text-purple-700",
  converted: "bg-green-50 text-green-700",
  lost: "bg-red-50 text-red-700",
};

const TEMP_COLORS: Record<string, string> = {
  hot: "bg-red-100 text-red-700 border-red-300",
  warm: "bg-orange-100 text-orange-700 border-orange-300",
  cold: "bg-blue-100 text-blue-700 border-blue-300",
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
  // Sort by score descending (hottest first)
  filtered.sort((a, b) => b.score - a.score);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;
  }

  const hotCount = leads.filter((l) => l.temperature === "hot").length;
  const warmCount = leads.filter((l) => l.temperature === "warm").length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads ({leads.length})</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="text-red-600 font-semibold">{hotCount} HOT</span>
            {" · "}
            <span className="text-orange-600 font-semibold">{warmCount} WARM</span>
            {" · Sorted by AI score (hottest first)"}
          </p>
        </div>
        <button
          onClick={exportLeads}
          className="bg-green-100 text-green-700 px-5 py-2.5 rounded-xl font-medium hover:bg-green-200 transition"
        >
          Export to CSV
        </button>
      </div>

      {/* Temperature Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="text-sm text-gray-500 py-2">Temperature:</span>
        {["all", "hot", "warm", "cold"].map((t) => (
          <button
            key={t}
            onClick={() => setTempFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tempFilter === t ? "gradient-brand text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <span className="text-sm text-gray-500 py-2">Status:</span>
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              filter === s ? "gradient-brand text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s} ({s === "all" ? leads.length : leads.filter((l) => l.status === s).length})
          </button>
        ))}
      </div>

      {/* Leads Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lead) => (
          <div key={lead.id} className={`bg-white rounded-2xl shadow-sm border-2 p-5 ${lead.temperature === "hot" ? "border-red-300" : lead.temperature === "warm" ? "border-orange-300" : "border-gray-200"}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="font-semibold text-lg">{lead.name || "Unknown"}</div>
                <div className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</div>
              </div>
              {lead.score > 0 && (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${TEMP_COLORS[lead.temperature] || "bg-gray-100 text-gray-700"}`}>
                  <span className="text-base">{lead.score}/10</span>
                  <span className="uppercase">{lead.temperature}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-3">
              <select
                value={lead.status}
                onChange={(e) => updateStatus(lead.id, e.target.value)}
                className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${STATUS_COLORS[lead.status] || ""}`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-sm">
              {lead.email && <div className="text-gray-600 truncate">Email: {lead.email}</div>}
              {lead.phone && <div className="text-gray-600">Phone: {lead.phone}</div>}
              {lead.budget && <div className="text-gray-600">Budget: {lead.budget}</div>}
              {lead.location && <div className="text-gray-600">Location: {lead.location}</div>}
              {lead.propertyType && <div className="text-gray-600">Type: {lead.propertyType}</div>}
              {lead.timeline && <div className="text-gray-600">Timeline: {lead.timeline}</div>}
              {lead.preApproved && <div className="text-green-600 font-semibold">Pre-Approved</div>}
            </div>

            {lead.scoreReason && (
              <div className="mt-3 pt-3 border-t text-xs text-gray-500 italic">&quot;{lead.scoreReason}&quot;</div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-2xl border">No leads match this filter.</div>
        )}
      </div>
    </div>
  );
}
