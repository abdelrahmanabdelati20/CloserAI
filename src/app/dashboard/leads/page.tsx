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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Leads ({leads.length})</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
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
          <div key={lead.id} className="bg-white rounded-2xl shadow-sm border p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold text-lg">{lead.name || "Unknown"}</div>
                <div className="text-sm text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</div>
              </div>
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
              {lead.email && <div className="text-gray-600">Email: {lead.email}</div>}
              {lead.phone && <div className="text-gray-600">Phone: {lead.phone}</div>}
              {lead.budget && <div className="text-gray-600">Budget: {lead.budget}</div>}
              {lead.location && <div className="text-gray-600">Location: {lead.location}</div>}
              {lead.propertyType && <div className="text-gray-600">Type: {lead.propertyType}</div>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No leads found.</div>
        )}
      </div>
    </div>
  );
}
