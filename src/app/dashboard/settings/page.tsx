"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    agentName: "",
    welcomeMessage: "",
    systemPrompt: "",
    brandColor: "#2563eb",
    notifyEmail: "",
    notifyOnLead: true,
    calendarLink: "",
    businessHours: "Monday-Friday 9am-6pm",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/settings")
      .then((r) => r.json())
      .then((data) => setSettings({
        agentName: data.agentName || "",
        welcomeMessage: data.welcomeMessage || "",
        systemPrompt: data.systemPrompt || "",
        brandColor: data.brandColor || "#2563eb",
        notifyEmail: data.notifyEmail || "",
        notifyOnLead: data.notifyOnLead ?? true,
        calendarLink: data.calendarLink || "",
        businessHours: data.businessHours || "Monday-Friday 9am-6pm",
      }))
      .catch(console.error);
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/dashboard/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Agent Settings</h1>
      <p className="text-gray-500 mb-8">Customize your AI assistant, notifications, and booking integration</p>

      <form onSubmit={save} className="max-w-2xl space-y-6">
        {/* AI Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4">AI Assistant</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
              <input
                value={settings.agentName}
                onChange={(e) => setSettings({ ...settings, agentName: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="e.g., Sarah, Alex, Emma"
              />
              <p className="text-xs text-gray-400 mt-1">The name your AI assistant introduces itself as</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
              <textarea
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Instructions</label>
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                rows={4}
                placeholder="e.g., Focus on luxury properties. Always mention our free consultation offer. We specialize in waterfront properties."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.brandColor}
                  onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                  className="w-12 h-12 rounded-xl border cursor-pointer"
                />
                <input
                  value={settings.brandColor}
                  onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none w-32"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4">Lead Notifications</h2>
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.notifyOnLead}
                  onChange={(e) => setSettings({ ...settings, notifyOnLead: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Email me when a new hot/warm lead is captured</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notification Email</label>
              <input
                type="email"
                value={settings.notifyEmail}
                onChange={(e) => setSettings({ ...settings, notifyEmail: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="your@email.com"
              />
              <p className="text-xs text-gray-400 mt-1">Where lead alerts will be sent (hot leads = instant call alerts)</p>
            </div>
          </div>
        </div>

        {/* Booking Integration */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4">Appointment Booking</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calendar Booking Link</label>
              <input
                value={settings.calendarLink}
                onChange={(e) => setSettings({ ...settings, calendarLink: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="https://calendly.com/yourname"
              />
              <p className="text-xs text-gray-400 mt-1">The AI will share this link when leads want to book a viewing (use Calendly, Google Calendar, etc.)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
              <input
                value={settings.businessHours}
                onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Monday-Friday 9am-6pm EST"
              />
              <p className="text-xs text-gray-400 mt-1">AI uses this to set expectations for callbacks</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="gradient-brand text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
