"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    agentName: "",
    welcomeMessage: "",
    systemPrompt: "",
    brandColor: "#2563eb",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/settings")
      .then((r) => r.json())
      .then(setSettings)
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Agent Settings</h1>

      <form onSubmit={save} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
            <input
              value={settings.agentName}
              onChange={(e) => setSettings({ ...settings, agentName: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="e.g., Sarah, Alex, PropertyBot"
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
              placeholder="The first message visitors see when they open the chat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Instructions</label>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              rows={5}
              placeholder="Additional instructions for the AI (e.g., 'Focus on luxury properties', 'Always mention our free consultation offer', 'We specialize in waterfront properties')"
            />
            <p className="text-xs text-gray-400 mt-1">These instructions shape how the AI talks to your visitors</p>
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
