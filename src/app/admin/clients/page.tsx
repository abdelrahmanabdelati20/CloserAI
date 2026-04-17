"use client";

import { useEffect, useState } from "react";

interface ClientData {
  id: string;
  businessName: string;
  plan: string;
  isActive: boolean;
  apiKey: string;
  paypalStatus: string;
  usageThisMonth: number;
  monthlyLimit: number;
  agentName: string;
  welcomeMessage: string;
  systemPrompt: string;
  brandColor: string;
  phone: string;
  website: string;
  user: { id: string; email: string; name: string };
  _count: { leads: number; conversations: number };
  createdAt: string;
}

export default function AdminClients() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [newClient, setNewClient] = useState({
    name: "", email: "", password: "", businessName: "", plan: "starter",
  });
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadClients = () => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then(setClients)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadClients(); }, []);

  const toggleClient = async (clientId: string, active: boolean) => {
    await fetch(`/api/admin/clients/${clientId}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: active }),
    });
    loadClients();
  };

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewClient({ name: "", email: "", password: "", businessName: "", plan: "starter" });
      loadClients();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create client");
    }
    setCreating(false);
  };

  const startEdit = (client: ClientData) => {
    setEditing(client.id);
    setEditData({
      businessName: client.businessName,
      plan: client.plan,
      monthlyLimit: client.monthlyLimit,
      agentName: client.agentName,
      welcomeMessage: client.welcomeMessage,
      systemPrompt: client.systemPrompt,
      brandColor: client.brandColor,
      phone: client.phone,
      website: client.website,
      newPassword: "",
    });
  };

  const saveEdit = async (clientId: string) => {
    await fetch(`/api/admin/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setEditing(null);
    loadClients();
  };

  const deleteClient = async (clientId: string) => {
    await fetch(`/api/admin/clients/${clientId}`, { method: "DELETE" });
    setConfirmDelete(null);
    loadClients();
  };

  const resetUsage = async (clientId: string) => {
    await fetch(`/api/admin/clients/${clientId}/reset-usage`, { method: "POST" });
    loadClients();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
        <div className="text-sm text-gray-500">Loading clients...</div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-1">
            Client Management
          </h1>
          <p className="text-gray-500">{clients.length} total clients · Full control over accounts, billing, and AI config</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="group inline-flex items-center gap-2 gradient-brand text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>

      {/* Create Client Form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Client</h2>
              <p className="text-sm text-gray-500">Manually create a client account</p>
            </div>
          </div>
          <form onSubmit={createClient} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Name</label>
              <input placeholder="John Smith" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input placeholder="john@example.com" type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input placeholder="Temporary password" type="text" value={newClient.password} onChange={(e) => setNewClient({ ...newClient, password: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
              <input placeholder="Sunshine Realty Group" value={newClient.businessName} onChange={(e) => setNewClient({ ...newClient, businessName: e.target.value })} required className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Plan</label>
              <select value={newClient.plan} onChange={(e) => setNewClient({ ...newClient, plan: e.target.value })} className={inputClass}>
                <option value="starter">Starter ($299/mo)</option>
                <option value="professional">Professional ($799/mo)</option>
                <option value="enterprise">Enterprise ($1,999/mo)</option>
              </select>
            </div>
            <button type="submit" disabled={creating} className="md:col-span-2 gradient-brand text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
              {creating ? "Creating..." : "Create Client Account"}
            </button>
          </form>
        </div>
      )}

      {/* Client Cards with Full Control */}
      <div className="space-y-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-premium ${
              !client.isActive ? "border-red-200" : "border-gray-200"
            }`}
          >
            {/* Client Header */}
            <div className="p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${client.isActive ? "gradient-brand shadow-blue-500/30" : "bg-gradient-to-br from-red-400 to-red-500 shadow-red-500/30"}`}>
                  {client.businessName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900">{client.businessName}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {client.user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${client.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${client.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                  {client.isActive ? "ACTIVE" : "DEACTIVATED"}
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize border border-blue-100">
                  {client.plan}
                </span>
                <span className="text-xs text-gray-400">
                  Since {new Date(client.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="px-6 pb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Leads</div>
                <div className="text-xl font-bold text-gray-900 mt-1">{client._count.leads}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Chats</div>
                <div className="text-xl font-bold text-gray-900 mt-1">{client._count.conversations}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Usage</div>
                <div className="text-sm font-bold text-gray-900 mt-1">{client.usageThisMonth} / {client.monthlyLimit >= 999999 ? "∞" : client.monthlyLimit.toLocaleString("en-US")}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">AI Name</div>
                <div className="text-sm font-bold text-gray-900 mt-1 truncate">{client.agentName}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">PayPal</div>
                <div className="text-sm font-bold text-gray-900 mt-1 capitalize">{client.paypalStatus}</div>
              </div>
            </div>

            {/* API Key */}
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 bg-gray-950 rounded-xl p-3 border border-gray-800">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <code className="text-green-400 text-xs flex-1 truncate font-mono">{client.apiKey}</code>
                <button
                  onClick={() => copyKey(client.apiKey)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition border ${
                    copiedKey === client.apiKey
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
                  }`}
                >
                  {copiedKey === client.apiKey ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-5 flex flex-wrap gap-2">
              <button
                onClick={() => toggleClient(client.id, !client.isActive)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition ${
                  client.isActive
                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                }`}
              >
                {client.isActive ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    Deactivate
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Activate
                  </>
                )}
              </button>
              <button onClick={() => startEdit(client)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>
              <button onClick={() => resetUsage(client.id)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Reset Usage
              </button>
              <button onClick={() => setConfirmDelete(client.id)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>

            {/* Delete Confirmation */}
            {confirmDelete === client.id && (
              <div className="px-6 pb-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-red-700 font-medium">Are you sure? This will delete ALL their data including leads and conversations.</span>
                  <div className="flex gap-2">
                    <button onClick={() => deleteClient(client.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">YES, DELETE</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-bold hover:bg-gray-300">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Panel */}
            {editing === client.id && (
              <div className="px-6 pb-6 border-t bg-blue-50/30">
                <div className="pt-4 mb-4 font-bold text-lg">Edit Client: {client.businessName}</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Business Name</label>
                    <input value={editData.businessName} onChange={(e) => setEditData({ ...editData, businessName: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Plan</label>
                    <select value={editData.plan} onChange={(e) => setEditData({ ...editData, plan: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500">
                      <option value="starter">Starter ($299/mo)</option>
                      <option value="professional">Professional ($799/mo)</option>
                      <option value="enterprise">Enterprise ($1,999/mo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Conversation Limit</label>
                    <input type="number" value={editData.monthlyLimit} onChange={(e) => setEditData({ ...editData, monthlyLimit: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">AI Agent Name</label>
                    <input value={editData.agentName} onChange={(e) => setEditData({ ...editData, agentName: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Brand Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={editData.brandColor} onChange={(e) => setEditData({ ...editData, brandColor: e.target.value })} className="w-12 h-10 rounded-xl border cursor-pointer" />
                      <input value={editData.brandColor} onChange={(e) => setEditData({ ...editData, brandColor: e.target.value })} className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Reset Password (leave empty to keep current)</label>
                    <input type="text" value={editData.newPassword} onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })} placeholder="New password..." className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Welcome Message</label>
                    <textarea value={editData.welcomeMessage} onChange={(e) => setEditData({ ...editData, welcomeMessage: e.target.value })} rows={2} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">AI System Prompt (Custom Instructions)</label>
                    <textarea value={editData.systemPrompt} onChange={(e) => setEditData({ ...editData, systemPrompt: e.target.value })} rows={3} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => saveEdit(client.id)} className="gradient-brand text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90">Save Changes</button>
                  <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-xl bg-gray-200 font-semibold hover:bg-gray-300">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {clients.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border">No clients yet. Click &quot;+ Add Client&quot; to create your first client.</div>
        )}
      </div>
    </div>
  );
}
