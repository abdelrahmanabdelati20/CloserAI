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
    notifyPhone: "",
    calendarLink: "",
    businessHours: "Monday-Friday 9am-6pm",
    webhookUrl: "",
    whiteLabel: false,
    plan: "starter",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isPro = settings.plan === "professional" || settings.plan === "enterprise";
  const isEnterprise = settings.plan === "enterprise";

  useEffect(() => {
    fetch("/api/dashboard/settings")
      .then((r) => r.json())
      .then((data) =>
        setSettings({
          agentName: data.agentName || "",
          welcomeMessage: data.welcomeMessage || "",
          systemPrompt: data.systemPrompt || "",
          brandColor: data.brandColor || "#2563eb",
          notifyEmail: data.notifyEmail || "",
          notifyOnLead: data.notifyOnLead ?? true,
          notifyPhone: data.notifyPhone || "",
          calendarLink: data.calendarLink || "",
          businessHours: data.businessHours || "Monday-Friday 9am-6pm",
          webhookUrl: data.webhookUrl || "",
          whiteLabel: data.whiteLabel || false,
          plan: data.plan || "starter",
        })
      )
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

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-1">
          Settings
        </h1>
        <p className="text-gray-500">Customize your AI assistant, notifications, and booking integration</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* AI Assistant section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-500">Customize how your AI agent introduces itself</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Agent Name</label>
              <input
                value={settings.agentName}
                onChange={(e) => setSettings({ ...settings, agentName: e.target.value })}
                className={inputClass}
                placeholder="e.g., Sarah, Alex, Emma"
              />
              <p className="text-xs text-gray-500 mt-1.5">The name your AI assistant introduces itself as</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Message</label>
              <textarea
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                className={inputClass}
                rows={3}
                placeholder="Hi there! I'm Sarah, your AI real estate assistant..."
              />
              <p className="text-xs text-gray-500 mt-1.5">The first message visitors see when they open the chat</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Instructions</label>
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                className={inputClass}
                rows={4}
                placeholder="e.g., Focus on luxury properties. Always mention our free consultation offer. We specialize in waterfront properties."
              />
              <p className="text-xs text-gray-500 mt-1.5">Additional context to shape how your AI talks to visitors</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Color</label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={settings.brandColor}
                    onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                    className="w-14 h-14 rounded-xl border border-gray-200 cursor-pointer"
                  />
                </div>
                <input
                  value={settings.brandColor}
                  onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                  className={`${inputClass} font-mono text-sm max-w-[180px]`}
                />
                <div
                  className="flex-1 h-14 rounded-xl shadow-inner"
                  style={{ background: `linear-gradient(135deg, ${settings.brandColor}, ${settings.brandColor}88)` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Your AI chat widget will use this color for accents</p>
            </div>
          </div>
        </div>

        {/* Lead Notifications section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Lead Notifications</h2>
              <p className="text-sm text-gray-500">Get instant alerts when the AI captures hot leads</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={settings.notifyOnLead}
                  onChange={(e) => setSettings({ ...settings, notifyOnLead: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all"></div>
                <svg
                  className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Email me when a new hot/warm lead is captured</div>
                <div className="text-xs text-gray-500 mt-0.5">Receive instant alerts the moment a qualified lead comes in</div>
              </div>
            </label>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Email</label>
              <input
                type="email"
                value={settings.notifyEmail}
                onChange={(e) => setSettings({ ...settings, notifyEmail: e.target.value })}
                className={inputClass}
                placeholder="your@email.com"
              />
              <p className="text-xs text-gray-500 mt-1.5">Where lead alerts will be sent (hot leads = instant call alerts)</p>
            </div>
          </div>
        </div>

        {/* Booking section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md shadow-green-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Appointment Booking</h2>
              <p className="text-sm text-gray-500">Connect your calendar for automated bookings</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Calendar Booking Link</label>
              <input
                value={settings.calendarLink}
                onChange={(e) => setSettings({ ...settings, calendarLink: e.target.value })}
                className={inputClass}
                placeholder="https://calendly.com/yourname"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                The AI will share this link when leads want to book a viewing. Works with Calendly, Google Calendar, Cal.com, etc.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Hours</label>
              <input
                value={settings.businessHours}
                onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                className={inputClass}
                placeholder="Monday-Friday 9am-6pm EST"
              />
              <p className="text-xs text-gray-500 mt-1.5">AI uses this to set expectations for callbacks</p>
            </div>
          </div>
        </div>

        {/* CRM / Zapier Integration — Pro+Enterprise */}
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${!isPro ? "opacity-60" : ""}`}>
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">CRM Integration (Zapier Ready)</h2>
              <p className="text-sm text-gray-500">{isPro ? "Send lead data to your CRM automatically" : "Upgrade to Professional to unlock"}</p>
            </div>
            {!isPro && <span className="ml-auto text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">PRO</span>}
          </div>
          {isPro && (
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Webhook URL</label>
                <input
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  We&apos;ll POST lead data here whenever a new lead is captured. Works with Zapier, Make, n8n, or any webhook endpoint.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 font-mono">
                <div className="font-semibold text-gray-700 mb-1 font-sans">Webhook payload:</div>
                {`{ "event": "lead.created", "lead": { "name", "email", "phone", "budget", "temperature", "score" } }`}
              </div>
            </div>
          )}
        </div>

        {/* SMS Alerts — Pro+Enterprise */}
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${!isPro ? "opacity-60" : ""}`}>
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">SMS Alerts</h2>
              <p className="text-sm text-gray-500">{isPro ? "Get text messages for hot leads" : "Upgrade to Professional to unlock"}</p>
            </div>
            {!isPro && <span className="ml-auto text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">PRO</span>}
          </div>
          {isPro && (
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number for SMS</label>
                <input
                  value={settings.notifyPhone}
                  onChange={(e) => setSettings({ ...settings, notifyPhone: e.target.value })}
                  className={inputClass}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-gray-500 mt-1.5">Enter your carrier email-to-SMS address (e.g., 5551234567@tmomail.net for T-Mobile, @vtext.com for Verizon, @txt.att.net for AT&amp;T) to receive instant text alerts when hot leads are captured</p>
              </div>
            </div>
          )}
        </div>

        {/* White-Label — Enterprise */}
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${!isEnterprise ? "opacity-60" : ""}`}>
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-md shadow-yellow-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">White-Label Branding</h2>
              <p className="text-sm text-gray-500">{isEnterprise ? "Remove CloserAI branding from your widget" : "Upgrade to Enterprise to unlock"}</p>
            </div>
            {!isEnterprise && <span className="ml-auto text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">ENTERPRISE</span>}
          </div>
          {isEnterprise && (
            <div className="p-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={settings.whiteLabel}
                    onChange={(e) => setSettings({ ...settings, whiteLabel: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all"></div>
                  <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Hide &quot;Powered by CloserAI&quot; from widget</div>
                  <div className="text-xs text-gray-500 mt-0.5">Your clients will see a clean, fully branded chat experience</div>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="group inline-flex items-center gap-2 gradient-brand text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : saved ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                Save changes
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
          {saved && (
            <div className="text-sm text-green-600 font-semibold animate-fade-in">Your settings have been updated!</div>
          )}
        </div>
      </form>
    </div>
  );
}
