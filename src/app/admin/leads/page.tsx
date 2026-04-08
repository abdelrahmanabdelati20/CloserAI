"use client";

import { useEffect, useState } from "react";

interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  budget: string;
  location: string;
  propertyType: string;
  client: { businessName: string };
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-yellow-50 text-yellow-700",
  qualified: "bg-purple-50 text-purple-700",
  converted: "bg-green-50 text-green-700",
  lost: "bg-red-50 text-red-700",
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Leads ({leads.length})</h1>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{lead.name || "Unknown"}</td>
                  <td className="px-6 py-4 text-sm">
                    <div>{lead.email || "-"}</div>
                    <div className="text-gray-400">{lead.phone || "-"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[lead.status] || "bg-gray-50 text-gray-700"}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{lead.budget || "-"}</td>
                  <td className="px-6 py-4 text-sm">{lead.location || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{lead.client.businessName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div className="text-center py-12 text-gray-400">No leads captured yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
