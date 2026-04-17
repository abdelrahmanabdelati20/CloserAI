"use client";

import { useState } from "react";
import Link from "next/link";

export default function FreeTrialPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    website: "",
    city: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ apiKey: string; password: string } | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess({ apiKey: data.apiKey, password: data.password });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (success) {
    const widgetCode = `<script src="https://closerai-app.vercel.app/widget.js" data-api-key="${success.apiKey}"></script>`;

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Your Free Trial is Ready!</h1>
              <p className="text-gray-600">Welcome to CloserAI, {form.name}. Your 14-day free trial has started.</p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">Your Login Credentials:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Login URL:</span>
                  <a href="/login" className="font-mono font-bold text-blue-900">closerai-app.vercel.app/login</a>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Email:</span>
                  <span className="font-mono font-bold text-blue-900">{form.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Password:</span>
                  <span className="font-mono font-bold text-blue-900">{success.password}</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-3">Save these credentials — you&apos;ll need them to log in.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="font-bold mb-3">Your Widget Code</h3>
              <p className="text-sm text-gray-600 mb-3">Paste this on your website before the closing &lt;/body&gt; tag:</p>
              <div className="bg-gray-900 rounded-xl p-3 overflow-x-auto">
                <code className="text-green-400 text-xs whitespace-nowrap">{widgetCode}</code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(widgetCode);
                  alert("Widget code copied!");
                }}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Click to copy code
              </button>
            </div>

            <div className="bg-yellow-50 rounded-2xl p-6 mb-6 border border-yellow-200">
              <h3 className="font-bold text-yellow-900 mb-2">What Happens Next:</h3>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li>Log in to your dashboard and customize your AI (name, welcome message, colors)</li>
                <li>Add your property listings (manual or bulk import)</li>
                <li>Paste the widget code on your website</li>
                <li>Watch leads roll in for 14 days — completely free</li>
                <li>After 14 days, subscribe to keep it running (from $299/mo — setup waived on annual)</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex-1 text-center py-4 rounded-xl text-white font-bold text-lg transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}
              >
                Go to Dashboard
              </Link>
              <Link
                href="/demo"
                className="flex-1 text-center py-4 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 transition"
              >
                Try Live Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">
              Closer<span className="gradient-text">AI</span>
            </span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">Already have an account?</Link>
        </div>
      </nav>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

        <div className="relative text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-semibold tracking-wider uppercase text-green-700 mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            LIMITED TIME: 14-Day Free Trial
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-5">
            Try CloserAI <span className="gradient-text-vivid">Free for 14 Days</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get your AI real estate assistant running in 5 minutes. No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center hover:shadow-premium hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="font-bold text-gray-900">5-Min Setup</h3>
            <p className="text-sm text-gray-500 mt-1">Paste one line of code</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center hover:shadow-premium hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="font-bold text-gray-900">No Credit Card</h3>
            <p className="text-sm text-gray-500 mt-1">Zero commitment</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center hover:shadow-premium hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="font-bold text-gray-900">Full Features</h3>
            <p className="text-sm text-gray-500 mt-1">Everything unlocked</p>
          </div>
        </div>

        <div className="relative max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-premium-lg border border-gray-200 p-6 sm:p-8 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@realty.com"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Miami, FL"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sunshine Realty Group"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Website</label>
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group w-full gradient-brand text-white py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {submitting ? "Setting up your account..." : "Start My Free 14-Day Trial"}
                {!submitting && (
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                )}
              </span>
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                No credit card
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Cancel anytime
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Ready in 60s
              </div>
            </div>
          </form>
        </div>

        <div className="relative max-w-xl mx-auto mt-8 text-center text-sm text-gray-500">
          <p>
            Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
          <p className="mt-3">
            Questions? Email <a href="https://mail.google.com/mail/?view=cm&to=AbdelrahmanAbdelati20@gmail.com" target="_blank" rel="noopener" className="text-blue-600 font-semibold hover:underline">AbdelrahmanAbdelati20@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
