"use client";

import { useState } from "react";

const PAYPAL_EMAIL = "AbdelrahmanAbdelati20@gmail.com";

const PLANS = [
  { id: "starter", name: "Starter", monthlyPrice: 297, setupFee: 997, features: ["1 Website", "500 chats/mo", "Lead capture", "Email support"] },
  { id: "professional", name: "Professional", monthlyPrice: 597, setupFee: 997, features: ["5 Websites", "2,000 chats/mo", "Property matching", "Priority support"], popular: true },
  { id: "enterprise", name: "Enterprise", monthlyPrice: 1497, setupFee: 1497, features: ["Unlimited websites", "Unlimited chats", "Custom AI training", "Dedicated manager"] },
];

export default function GetStartedPage() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [form, setForm] = useState({ name: "", email: "", phone: "", businessName: "", website: "" });
  const [submitted, setSubmitted] = useState(false);

  const plan = PLANS.find((p) => p.id === selectedPlan)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save the lead/signup request
    try {
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: selectedPlan }),
      });
    } catch {}
    setSubmitted(true);
  };

  const paySetupFee = () => {
    const itemName = encodeURIComponent(`CloserAI ${plan.name} Plan - Setup Fee`);
    window.open(
      `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(PAYPAL_EMAIL)}&amount=${plan.setupFee}&currency_code=USD&item_name=${itemName}&no_shipping=1&return=${encodeURIComponent(window.location.origin + "/get-started?paid=true")}&cancel_return=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">You&apos;re Almost There!</h1>
          <p className="text-gray-600 mb-6">
            Thank you, {form.name}! We received your signup for the <strong>{plan.name}</strong> plan.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-bold mb-3">Next Steps:</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <div>
                  <div className="font-medium">Pay Setup Fee (${plan.setupFee})</div>
                  <div className="text-sm text-gray-500">One-time payment to configure your AI assistant</div>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <div>
                  <div className="font-medium">We set up your account (within 24 hours)</div>
                  <div className="text-sm text-gray-500">Custom AI assistant, dashboard access, widget code</div>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <div>
                  <div className="font-medium">Start capturing leads!</div>
                  <div className="text-sm text-gray-500">Paste one line of code and your AI goes live</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={paySetupFee}
            className="w-full py-4 rounded-xl text-white font-bold text-lg transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}
          >
            Pay ${plan.setupFee} Setup Fee via PayPal
          </button>
          <p className="text-xs text-gray-400 mt-3">Secure payment via PayPal. 7-day money-back guarantee.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}>C</div>
            <span className="text-xl font-bold">Closer<span className="text-blue-600">AI</span></span>
          </a>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className={`${step >= 1 ? "text-blue-600 font-bold" : ""}`}>1. Choose Plan</span>
            <span>&rarr;</span>
            <span className={`${step >= 2 ? "text-blue-600 font-bold" : ""}`}>2. Your Details</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-center mb-2">Choose Your Plan</h1>
            <p className="text-gray-500 text-center mb-10">All plans include the AI chat widget, lead dashboard, and 24/7 support.</p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`text-left rounded-2xl p-6 border-2 transition ${
                    selectedPlan === p.id
                      ? "border-blue-600 bg-blue-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {(p as any).popular && <div className="text-xs font-bold text-blue-600 uppercase mb-2">Most Popular</div>}
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 my-2">${p.monthlyPrice}<span className="text-sm text-gray-400">/mo</span></div>
                  <div className="text-sm text-gray-500 mb-3">+ ${p.setupFee} setup fee</div>
                  <ul className="space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep(2)}
                className="px-10 py-4 rounded-xl text-white font-bold text-lg transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}
              >
                Continue with {plan.name} Plan &rarr;
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold text-center mb-2">Tell Us About Your Business</h1>
            <p className="text-gray-500 text-center mb-10">We&apos;ll use this to set up your custom AI assistant.</p>

            <div className="max-w-lg mx-auto">
              <div className="bg-blue-50 rounded-xl p-4 mb-6 flex justify-between items-center">
                <div>
                  <div className="font-bold text-blue-800">{plan.name} Plan</div>
                  <div className="text-sm text-blue-600">${plan.monthlyPrice}/mo + ${plan.setupFee} setup</div>
                </div>
                <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">Change</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Smith" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Sunshine Realty Group" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://yourwebsite.com" />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl text-white font-bold text-lg transition hover:opacity-90 mt-4"
                  style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}
                >
                  Sign Up &amp; Proceed to Payment
                </button>
                <p className="text-xs text-gray-400 text-center">7-day money-back guarantee. Cancel anytime.</p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
