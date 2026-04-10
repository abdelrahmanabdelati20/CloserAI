"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";

const PAYPAL_CLIENT_ID = "Ad0tNNgcXsJVUzrp2izuKq15cT4tCAAyEw6UqNIrKNwNMcHARRgQhqpwSUScL7B2dCnQ0UyvlFVuBZEw";

const PLANS = [
  { id: "starter", planId: "P-3ME68261TF865700ANHMV6VA", name: "Starter", monthlyPrice: 297, features: ["1 Website Widget", "1,000 AI Conversations/month", "Lead Capture & Management", "50+ Languages", "Email Support"] },
  { id: "professional", planId: "P-2MY58249L8606483BNHMWLZI", name: "Professional", monthlyPrice: 597, features: ["5 Website Widgets", "3,000 AI Conversations/month", "Advanced Lead Scoring", "Property Matching AI", "CRM Integration", "Priority Support (24h)"], popular: true },
  { id: "enterprise", planId: "P-25E55064LR4216211NHMWNOA", name: "Enterprise", monthlyPrice: 1297, features: ["Unlimited Widgets", "10,000 AI Conversations/month", "White-Label Option", "Custom AI Training", "Dedicated Account Manager"] },
];

export default function GetStartedPage() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [form, setForm] = useState({ name: "", email: "", phone: "", businessName: "", website: "" });
  const [submitted, setSubmitted] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const paypalRef = useRef<HTMLDivElement>(null);
  const [paypalReady, setPaypalReady] = useState(false);

  const plan = PLANS.find((p) => p.id === selectedPlan)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: selectedPlan }),
      });
    } catch {}
    setSubmitted(true);
  };

  // Render PayPal button when SDK is ready and we're on the payment step
  useEffect(() => {
    if (!submitted || !paypalReady || !paypalRef.current) return;
    if (paypalRef.current.childNodes.length > 0) return; // Already rendered

    const paypal = (window as any).paypal;
    if (!paypal) return;

    paypal.Buttons({
      style: { shape: "rect", color: "gold", layout: "vertical", label: "subscribe" },
      createSubscription: function (_data: any, actions: any) {
        return actions.subscription.create({ plan_id: plan.planId });
      },
      onApprove: function (data: any) {
        setSubscriptionId(data.subscriptionID);
        // Notify our API about the subscription
        fetch("/api/signup/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, subscriptionId: data.subscriptionID, plan: selectedPlan }),
        }).catch(() => {});
      },
    }).render(paypalRef.current);
  }, [submitted, paypalReady, plan.planId, form.email, selectedPlan]);

  // Success state after payment
  if (subscriptionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">Welcome to CloserAI!</h1>
          <p className="text-gray-600 mb-6">
            Payment successful! Your subscription ID is: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{subscriptionId}</code>
          </p>
          <div className="bg-blue-50 rounded-xl p-6 text-left mb-6">
            <h3 className="font-bold text-blue-800 mb-3">What happens next:</h3>
            <ol className="space-y-2 text-sm text-blue-700">
              <li className="flex gap-2"><span className="font-bold">1.</span> We&apos;ll set up your custom AI assistant within 24 hours</li>
              <li className="flex gap-2"><span className="font-bold">2.</span> You&apos;ll receive login credentials via email</li>
              <li className="flex gap-2"><span className="font-bold">3.</span> You customize the AI and paste one line of code on your site</li>
              <li className="flex gap-2"><span className="font-bold">4.</span> Your AI starts capturing leads 24/7!</li>
            </ol>
          </div>
          <p className="text-gray-500 text-sm">Questions? Reply to your confirmation email or contact us anytime.</p>
        </div>
      </div>
    );
  }

  // Payment step (after form submission)
  if (submitted) {
    return (
      <>
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`}
          data-sdk-integration-source="button-factory"
          onReady={() => setPaypalReady(true)}
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
              <p className="text-gray-500">Subscribe to the {plan.name} plan to get started</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Plan</span>
                <span className="font-bold">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Setup Fee</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Monthly Subscription</span>
                <span className="font-bold">${plan.monthlyPrice}/mo</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between items-center">
                <span className="font-bold">Due Today</span>
                <span className="font-bold text-xl text-blue-600">${plan.monthlyPrice}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">Then ${plan.monthlyPrice}/month. Cancel anytime.</div>
            </div>

            {/* PayPal Subscribe Button */}
            <div ref={paypalRef} className="mb-4" />

            {!paypalReady && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading payment options...</p>
              </div>
            )}

            <div className="text-center mt-4">
              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Secure payment via PayPal. 30-day money-back guarantee.
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main signup flow
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
            <span>&rarr;</span>
            <span>3. Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-center mb-2">Choose Your Plan</h1>
            <p className="text-gray-500 text-center mb-10">All plans include AI chat widget, lead dashboard, and multilingual support (50+ languages).</p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`text-left rounded-2xl p-6 border-2 transition ${
                    selectedPlan === p.id ? "border-blue-600 bg-blue-50 shadow-lg" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {(p as any).popular && <div className="text-xs font-bold text-blue-600 uppercase mb-2">⭐ Most Popular</div>}
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 my-2">${p.monthlyPrice}<span className="text-sm text-gray-400">/mo</span></div>
                  <div className="text-sm text-green-600 font-semibold mb-3">$0 setup fee</div>
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
              <button onClick={() => setStep(2)} className="px-10 py-4 rounded-xl text-white font-bold text-lg transition hover:opacity-90" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}>
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
                  <div className="text-sm text-blue-600">${plan.monthlyPrice}/mo · $0 setup fee</div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business / Brokerage Name *</label>
                  <input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Sunshine Realty Group" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Website URL</label>
                  <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://yourwebsite.com" />
                </div>

                <button type="submit" className="w-full py-4 rounded-xl text-white font-bold text-lg transition hover:opacity-90 mt-4" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}>
                  Continue to Payment &rarr;
                </button>
                <p className="text-xs text-gray-400 text-center">30-day money-back guarantee. Cancel anytime.</p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
