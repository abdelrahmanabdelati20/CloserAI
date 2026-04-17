"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";

const PAYPAL_CLIENT_ID = "Ad0tNNgcXsJVUzrp2izuKq15cT4tCAAyEw6UqNIrKNwNMcHARRgQhqpwSUScL7B2dCnQ0UyvlFVuBZEw";

const MONTHLY_PLANS = [
  { id: "starter", planId: "P-3ME68261TF865700ANHMV6VA", name: "Starter", monthlyPrice: 299, annualTotal: 0, features: ["1 Website Widget", "1,000 AI Conversations/month", "Full CRM (Leads + Deals + Tasks)", "Email Campaigns + Smart Plans", "Home Valuations + Landing Pages", "50+ Languages AI Chat"] },
  { id: "professional", planId: "P-2MY58249L8606483BNHMWLZI", name: "Professional", monthlyPrice: 799, annualTotal: 0, features: ["5 Website Widgets", "3,000 AI Conversations/month", "Unlimited Email + SMS Campaigns", "Power Dialer + Call Log", "Transactions + Team Management", "CRM Webhooks (SF, HubSpot, FUB)"], popular: true },
  { id: "enterprise", planId: "P-25E55064LR4216211NHMWNOA", name: "Enterprise", monthlyPrice: 1999, annualTotal: 0, features: ["Unlimited Widgets + Team", "10,000 AI Conversations/month", "White-Label Branding", "Full REST API Access", "IDX / MLS Feed Setup", "Priority Support (4h)"] },
];

const ANNUAL_PLANS = [
  { id: "starter", planId: "P-2J09452604397282GNHO4GSQ", name: "Starter", monthlyPrice: 249, annualTotal: 2990, features: MONTHLY_PLANS[0].features },
  { id: "professional", planId: "P-93R54480Y01739649NHO4HXY", name: "Professional", monthlyPrice: 666, annualTotal: 7990, features: MONTHLY_PLANS[1].features, popular: true },
  { id: "enterprise", planId: "P-7KN90917L04901723NHO4JCQ", name: "Enterprise", monthlyPrice: 1666, annualTotal: 19990, features: MONTHLY_PLANS[2].features },
];

export default function GetStartedPage() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [form, setForm] = useState({ name: "", email: "", phone: "", businessName: "", website: "" });
  const [submitted, setSubmitted] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const paypalRef = useRef<HTMLDivElement>(null);
  const [paypalReady, setPaypalReady] = useState(false);

  // Read billing=annual URL param on mount (client-only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "annual") setBilling("annual");
  }, []);

  const PLANS = billing === "annual" ? ANNUAL_PLANS : MONTHLY_PLANS;
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
                <span className="font-bold">{plan.name} ({billing === "annual" ? "Annual" : "Monthly"})</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Setup Fee</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{billing === "annual" ? "Annual Subscription" : "Monthly Subscription"}</span>
                <span className="font-bold">
                  {billing === "annual" && plan.annualTotal
                    ? `$${plan.annualTotal.toLocaleString("en-US")}/yr`
                    : `$${plan.monthlyPrice}/mo`}
                </span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between items-center">
                <span className="font-bold">Due Today</span>
                <span className="font-bold text-xl text-blue-600">
                  ${billing === "annual" && plan.annualTotal ? plan.annualTotal.toLocaleString("en-US") : plan.monthlyPrice}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {billing === "annual" && plan.annualTotal
                  ? `Then $${plan.annualTotal.toLocaleString("en-US")}/year. Cancel anytime.`
                  : `Then $${plan.monthlyPrice}/month. Cancel anytime.`}
              </div>
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
                Secure payment via PayPal. Cancel anytime from your dashboard.
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main signup flow
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-4">
          <a href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">Closer<span className="gradient-text">AI</span></span>
          </a>
          <div className="hidden md:flex items-center gap-3 text-xs sm:text-sm">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${step >= 1 ? "gradient-brand text-white font-semibold shadow-md" : "text-gray-500"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? "bg-white/20" : "bg-gray-200"}`}>1</span>
              Choose Plan
            </span>
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${step >= 2 ? "gradient-brand text-white font-semibold shadow-md" : "text-gray-500"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? "bg-white/20" : "bg-gray-200"}`}>2</span>
              Your Details
            </span>
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-500">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-200">3</span>
              Payment
            </span>
          </div>
          <div className="md:hidden text-xs text-gray-500">Step {step} of 3</div>
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

        {step === 1 && (
          <div className="relative">
            <div className="text-center mb-10 sm:mb-14">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
                Choose your <span className="gradient-text-vivid">plan</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">All plans include AI chat widget, lead dashboard, and multilingual support (50+ languages).</p>

              {/* Billing Toggle */}
              <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-1.5 shadow-premium">
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    billing === "monthly" ? "gradient-brand text-white shadow-md" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("annual")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                    billing === "annual" ? "gradient-brand text-white shadow-md" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Annual
                  <span className="ml-1.5 text-[10px] bg-yellow-400 text-gray-900 px-1.5 py-0.5 rounded-full font-bold">Save 17%</span>
                </button>
              </div>
              {billing === "annual" && (
                <p className="text-sm text-green-600 mt-3 font-semibold">Pay for 10 months, get 12 — save 17%.</p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-5 sm:gap-6 mb-10">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`relative text-left rounded-3xl p-6 sm:p-7 border-2 transition-all ${
                    selectedPlan === p.id
                      ? "border-blue-500 bg-blue-50 shadow-premium-lg scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-premium"
                  }`}
                >
                  {(p as any).popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-[10px] font-bold shadow-md">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  {selectedPlan === p.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full gradient-brand flex items-center justify-center shadow-md">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                  <div className="mt-3">
                    <span className="text-4xl font-bold tracking-tight gradient-text-vivid">${p.monthlyPrice}</span>
                    <span className="text-sm text-gray-500 ml-1">/mo</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {billing === "annual" && p.annualTotal ? `$${p.annualTotal.toLocaleString("en-US")} billed annually` : "Billed monthly"}
                  </div>
                  <div className="text-xs text-green-600 font-semibold mb-4">✓ $0 setup fee</div>
                  <ul className="space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
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
                className="group gradient-brand text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
              >
                <span className="inline-flex items-center gap-2">
                  Continue with {plan.name} Plan
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </span>
              </button>
              <p className="text-xs text-gray-500 mt-5">
                Questions? Email <a href="https://mail.google.com/mail/?view=cm&to=AbdelrahmanAbdelati20@gmail.com" target="_blank" rel="noopener" className="text-blue-600 font-semibold hover:underline">AbdelrahmanAbdelati20@gmail.com</a>
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="relative">
            <div className="text-center mb-10 sm:mb-14">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
                Tell us about your <span className="gradient-text-vivid">business</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">We&apos;ll use this to set up your custom AI assistant.</p>
            </div>

            <div className="max-w-lg mx-auto">
              <div className="gradient-brand rounded-2xl p-5 mb-6 flex justify-between items-center text-white shadow-lg shadow-blue-500/30">
                <div>
                  <div className="font-bold">{plan.name} Plan ({billing === "annual" ? "Annual" : "Monthly"})</div>
                  <div className="text-sm text-white/80">
                    {billing === "annual" && plan.annualTotal
                      ? `$${plan.annualTotal.toLocaleString("en-US")}/yr · $0 setup fee`
                      : `$${plan.monthlyPrice}/mo · $0 setup fee`}
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="text-sm text-white/80 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition">Change</button>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-premium-lg border border-gray-200 p-6 sm:p-8 space-y-4">
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

                <button
                  type="submit"
                  className="group w-full gradient-brand text-white py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all mt-4"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    Continue to Payment
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </span>
                </button>
                <p className="text-xs text-gray-400 text-center">14-day free trial included. Cancel anytime from your dashboard.</p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Questions? Email <a href="https://mail.google.com/mail/?view=cm&to=AbdelrahmanAbdelati20@gmail.com" target="_blank" rel="noopener" className="text-blue-600 font-semibold hover:underline">AbdelrahmanAbdelati20@gmail.com</a>
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
