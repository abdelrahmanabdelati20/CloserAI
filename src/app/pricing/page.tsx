"use client";

import { useState } from "react";

const PLANS = [
  {
    name: "Starter",
    monthly: 297,
    annual: 2970, // Save $594 (2 months free)
    tagline: "Perfect for solo realtors",
    conversations: "1,000",
    features: [
      "1 Website Widget",
      "1,000 AI Conversations/month",
      "Lead Capture & Scoring",
      "50+ Languages Support",
      "Conversation History",
      "Basic Analytics Dashboard",
      "Email Support",
      "Setup in 5 Minutes",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
  {
    name: "Professional",
    monthly: 597,
    annual: 5970, // Save $1,194 (2 months free)
    tagline: "For growing real estate teams",
    conversations: "3,000",
    features: [
      "5 Website Widgets",
      "3,000 AI Conversations/month",
      "Advanced Lead Scoring & Intent Detection",
      "Property Matching AI",
      "CRM Integration (Zapier Ready)",
      "Priority Support (24h Response)",
      "Custom AI Training",
      "Detailed Analytics & Reports",
      "Email & SMS Alerts",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    monthly: 1297,
    annual: 12970, // Save $2,594 (2 months free)
    tagline: "For brokerages & large teams",
    conversations: "10,000",
    features: [
      "Unlimited Website Widgets",
      "10,000 AI Conversations/month",
      "White-Label Option",
      "Full API Access",
      "Dedicated Account Manager",
      "Custom Integrations",
      "Custom AI Training",
      "Priority SMS/Email Alerts",
      "SLA Guarantee & Onboarding Call",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
];

const FAQS = [
  {
    q: "Is there really no setup fee?",
    a: "Correct — $0 setup fee. No hidden costs, no contracts. Start your 14-day free trial, and if CloserAI delivers leads, keep it. If not, walk away free. We're confident you'll love it.",
  },
  {
    q: "What happens after the 14-day free trial?",
    a: "You'll be prompted to subscribe to any of the plans above via PayPal. No credit card required during trial. If you don't subscribe, your account simply pauses — no charges, ever.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your PayPal account in 2 clicks. No questions asked, no cancellation fees, no contracts. You only pay for months you actually use.",
  },
  {
    q: "What if I exceed my conversation limit?",
    a: "We'll notify you at 80% usage. You can either upgrade to a higher plan or pay overage: $0.50 per extra conversation (billed monthly). Most clients use only 30-50% of their limit.",
  },
  {
    q: "How does CloserAI compare to Structurely or Realty AI?",
    a: "Structurely starts at $500/mo with contracts. Realty AI starts at $299/mo. Conversica and Drift charge $2,500+/mo. CloserAI is smarter AND cheaper — built specifically for real estate with 50+ native languages.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never share your leads with third parties. GDPR and CCPA compliant.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. Upgrade or downgrade anytime from your dashboard. Changes take effect at your next billing cycle. Downgrade to a lower tier? We'll credit the difference.",
  },
  {
    q: "Do you offer a money-back guarantee?",
    a: "Yes! 30-day money-back guarantee on all paid plans. If you're not completely satisfied within your first 30 days of paid service, we'll refund 100%. No questions, no hassle.",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"}}>
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold">
              Closer<span className="text-blue-600">AI</span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/demo" className="hidden sm:inline text-sm text-gray-600 hover:text-blue-600">Live Demo</a>
            <a href="/login" className="text-sm text-gray-600 hover:text-blue-600">Login</a>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-sm font-medium text-green-700 mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            14-day free trial · No credit card · $0 setup fee
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            One closed real estate deal pays for a full year of CloserAI. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-white border border-gray-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                billing === "monthly" ? "text-white shadow-md" : "text-gray-600 hover:text-gray-900"
              }`}
              style={billing === "monthly" ? {background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"} : {}}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition relative ${
                billing === "annual" ? "text-white shadow-md" : "text-gray-600 hover:text-gray-900"
              }`}
              style={billing === "annual" ? {background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"} : {}}
            >
              Annual
              <span className="ml-1 text-xs bg-yellow-400 text-gray-900 px-1.5 py-0.5 rounded-full font-bold">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => {
            const displayPrice = billing === "monthly" ? plan.monthly : Math.round(plan.annual / 12);
            // Use explicit en-US locale to prevent server/client hydration mismatch
            const formatNum = (n: number) => n.toLocaleString("en-US");
            const billedAs = billing === "annual" ? `$${formatNum(plan.annual)} billed annually` : "Billed monthly";
            const savings = billing === "annual" ? plan.monthly * 12 - plan.annual : 0;

            return (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col relative ${
                  plan.popular
                    ? "text-white shadow-2xl md:scale-105"
                    : "bg-white border-2 border-gray-100 shadow-sm"
                }`}
                style={plan.popular ? {background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"} : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className={`text-sm mb-5 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>{plan.tagline}</p>
                <div className="mb-1">
                  <span className="text-5xl font-bold">${displayPrice}</span>
                  <span className={plan.popular ? "text-white/70" : "text-gray-500"}>/month</span>
                </div>
                <div className={`text-xs mb-1 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>
                  {billedAs}
                </div>
                {savings > 0 ? (
                  <div className={`text-xs font-bold mb-6 ${plan.popular ? "text-yellow-300" : "text-green-600"}`}>
                    💰 Save ${formatNum(savings)}/year
                  </div>
                ) : (
                  <div className="mb-6 h-4"></div>
                )}

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? "text-yellow-300" : "text-green-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/free-trial"
                  className={`w-full py-3 rounded-xl font-semibold transition text-center block ${
                    plan.popular
                      ? "bg-white text-blue-700 hover:bg-gray-100"
                      : "text-white hover:opacity-90"
                  }`}
                  style={!plan.popular ? {background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"} : {}}
                >
                  {plan.cta} →
                </a>
                <p className={`text-xs text-center mt-2 ${plan.popular ? "text-white/60" : "text-gray-400"}`}>
                  No credit card required
                </p>
              </div>
            );
          })}
        </div>

        {/* ROI Calculator */}
        <div className="max-w-4xl mx-auto mt-20 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 md:p-10">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">💰</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Quick ROI Math</h2>
            <p className="text-gray-600">Let&apos;s be honest — this is what matters most to real estate agents.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl p-5 border border-yellow-100">
              <div className="text-3xl font-bold text-gray-900">1 deal</div>
              <div className="text-sm text-gray-600 mt-1">Average closed deal</div>
              <div className="text-xs text-green-600 mt-2 font-semibold">= $5,000 - $50,000 commission</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-yellow-100">
              <div className="text-3xl font-bold text-gray-900">$5,970</div>
              <div className="text-sm text-gray-600 mt-1">CloserAI Pro (annual)</div>
              <div className="text-xs text-green-600 mt-2 font-semibold">Save $1,194/year</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-yellow-100">
              <div className="text-3xl font-bold text-green-600">700%+</div>
              <div className="text-sm text-gray-600 mt-1">ROI from 1 extra deal</div>
              <div className="text-xs text-green-600 mt-2 font-semibold">Pays for itself instantly</div>
            </div>
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">How CloserAI Compares</h2>
          <p className="text-center text-gray-500 mb-8">Built smarter, priced lower than every competitor.</p>
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Platform</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Starting</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Setup Fee</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Real Estate</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Languages</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 font-bold text-blue-700">CloserAI (Us)</td>
                    <td className="px-6 py-4 font-bold text-blue-700">$297/mo</td>
                    <td className="px-6 py-4 text-green-600 font-bold">$0</td>
                    <td className="px-6 py-4">✅ Purpose-built</td>
                    <td className="px-6 py-4">🌍 50+</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Structurely</td>
                    <td className="px-6 py-4 text-red-600">$500/mo</td>
                    <td className="px-6 py-4 text-red-600">Yes</td>
                    <td className="px-6 py-4">✅ Yes</td>
                    <td className="px-6 py-4">English only</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Realty AI</td>
                    <td className="px-6 py-4 text-red-600">$299/mo</td>
                    <td className="px-6 py-4">None</td>
                    <td className="px-6 py-4">✅ Yes</td>
                    <td className="px-6 py-4">Limited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Ylopo</td>
                    <td className="px-6 py-4 text-red-600">$495/mo</td>
                    <td className="px-6 py-4 text-red-600">$1,500</td>
                    <td className="px-6 py-4">✅ Yes</td>
                    <td className="px-6 py-4">English only</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Conversica</td>
                    <td className="px-6 py-4 text-red-600">$2,499/mo</td>
                    <td className="px-6 py-4 text-red-600">Yes</td>
                    <td className="px-6 py-4">❌ Generic</td>
                    <td className="px-6 py-4">Limited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Drift</td>
                    <td className="px-6 py-4 text-red-600">$2,500/mo</td>
                    <td className="px-6 py-4 text-red-600">Yes</td>
                    <td className="px-6 py-4">❌ Generic</td>
                    <td className="px-6 py-4">Limited</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">Start Free Trial</h3>
              <p className="text-gray-600 text-sm">14 days free, full access, no credit card required.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">Embed the Widget</h3>
              <p className="text-gray-600 text-sm">Copy-paste one line of code. Live on your site in 5 minutes.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">Subscribe When Ready</h3>
              <p className="text-gray-600 text-sm">Love it? Pay via PayPal. Cancel anytime with 2 clicks.</p>
            </div>
          </div>
        </div>

        {/* Guarantees */}
        <div className="max-w-4xl mx-auto mt-16 grid md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-1">💰</div>
            <h3 className="font-bold text-green-800 mb-1">30-Day Money-Back</h3>
            <p className="text-sm text-green-700">Full refund, no questions asked.</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-1">🔓</div>
            <h3 className="font-bold text-blue-800 mb-1">No Lock-In</h3>
            <p className="text-sm text-blue-700">Cancel anytime, no contracts.</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-1">🔐</div>
            <h3 className="font-bold text-purple-800 mb-1">Enterprise Security</h3>
            <p className="text-sm text-purple-700">Encrypted. GDPR compliant.</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details key={faq.q} className="bg-white rounded-2xl border p-5 cursor-pointer group">
                <summary className="font-semibold text-gray-900 flex justify-between items-center list-none">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto mt-20 rounded-3xl p-10 md:p-12 text-center text-white" style={{background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"}}>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to Close More Deals?</h2>
          <p className="text-lg text-white/80 mb-6 max-w-xl mx-auto">
            Join real estate agents converting more leads while they sleep.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/free-trial" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition">
              Start Free 14-Day Trial →
            </a>
            <a href="/demo" className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition">
              Try Live Demo
            </a>
          </div>
          <p className="text-sm text-white/60 mt-4">Questions? Email <a href="mailto:AbdelrahmanAbdelati20@gmail.com" className="underline">AbdelrahmanAbdelati20@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
}
