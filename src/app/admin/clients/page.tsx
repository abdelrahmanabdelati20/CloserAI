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
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-500 mt-1">Full control over all client accounts</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="gradient-brand text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition"
        >
          + Add Client
        </button>
      </div>

      {/* Create Client Form */}
      {showCreate && (
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Create New Client</h2>
          <form onSubmit={createClient} className="grid md:grid-cols-2 gap-4">
            <input placeholder="Contact Name" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} required className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
            <input placeholder="Email" type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} required className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
            <input placeholder="Password" type="text" value={newClient.password} onChange={(e) => setNewClient({ ...newClient, password: e.target.value })} required className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
            <input placeholder="Business Name" value={newClient.businessName} onChange={(e) => setNewClient({ ...newClient, businessName: e.target.value })} required className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
            <select value={newClient.plan} onChange={(e) => setNewClient({ ...newClient, plan: e.target.value })} className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none">
              <option value="starter">Starter ($297/mo)</option>
              <option value="professional">Professional ($597/mo)</option>
              <option value="enterprise">Enterprise ($1,497/mo)</option>
            </select>
            <button type="submit" disabled={creating} className="gradient-brand text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
              {creating ? "Creating..." : "Create Client"}
            </button>
          </form>
        </div>
      )}

      {/* Client Cards with Full Control */}
      <div className="space-y-4">
        {clients.map((client) => (
          <div key={client.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${!client.isActive ? "border-red-200 bg-red-50/30" : ""}`}>
            {/* Client Header */}
            <div className="p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${client.isActive ? "gradient-brand" : "bg-red-400"}`}>
                  {client.businessName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-lg">{client.businessName}</div>
                  <div className="text-sm text-gray-500">{client.user.email} | {client.user.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${client.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {client.isActive ? "ACTIVE" : "DEACTIVATED"}
                </span>
                <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold uppercase">
                  {client.plan}
                </span>
                <span className="text-xs text-gray-400">
                  Since {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="px-6 pb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500">Leads</div>
                <div className="text-xl font-bold text-brand-700">{client._count.leads}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500">Conversations</div>
                <div className="text-xl font-bold text-purple-700">{client._count.conversations}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500">Usage This Month</div>
                <div className="text-xl font-bold text-orange-700">{client.usageThisMonth} / {client.monthlyLimit === 999999 ? "Unltd" : client.monthlyLimit}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500">AI Agent</div>
                <div className="text-sm font-bold truncate">{client.agentName}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500">PayPal</div>
                <div className="text-sm font-bold capitalize">{client.paypalStatus}</div>
              </div>
            </div>

            {/* API Key */}
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 bg-gray-900 rounded-xl p-3">
                <code className="text-green-400 text-xs flex-1 truncate">{client.apiKey}</code>
                <button onClick={() => copyKey(client.apiKey)} className="text-white/70 hover:text-white text-xs px-3 py-1 bg-white/10 rounded-lg">
                  {copiedKey === client.apiKey ? "Copied!" : "Copy Key"}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-4 flex flex-wrap gap-2">
              <button
                onClick={() => toggleClient(client.id, !client.isActive)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  client.isActive
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {client.isActive ? "DEACTIVATE SERVICE" : "ACTIVATE SERVICE"}
              </button>
              <button onClick={() => startEdit(client)} className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
                Edit Everything
              </button>
              <button onClick={() => resetUsage(client.id)} className="px-4 py-2 rounded-xl text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition">
                Reset Usage Counter
              </button>
              <button onClick={() => setConfirmDelete(client.id)} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition">
                Delete Client
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
                      <option value="starter">Starter ($297/mo)</option>
                      <option value="professional">Professional ($597/mo)</option>
                      <option value="enterprise">Enterprise ($1,497/mo)</option>
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
