"use client";

import { useState } from "react";

const PLANS = [
  {
    name: "Starter",
    monthly: 299,
    annual: 2990, // Save $598 (pay 10, get 2 free)
    setupFee: 997,
    tagline: "For solo agents",
    conversations: "1,000",
    features: [
      "1 Website Widget",
      "1,000 AI Conversations/month",
      "Full CRM (Leads + Deals + Tasks + Notes)",
      "Activity Timeline & Analytics",
      "Email Drip Campaigns (3 sequences)",
      "Smart Plans (2 automations)",
      "Home Valuations (seller leads)",
      "Landing Page Builder (3 pages)",
      "Property Matching AI",
      "50+ Languages AI Chat",
      "Zapier + Calendar Integrations",
      "Email Lead Alerts",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
  {
    name: "Professional",
    monthly: 799,
    annual: 7990, // Save $1,598 (pay 10, get 2 free)
    setupFee: 1997,
    tagline: "For growing real estate teams",
    conversations: "3,000",
    features: [
      "Everything in Starter, plus:",
      "5 Website Widgets",
      "3,000 AI Conversations/month",
      "Unlimited Email + SMS Campaigns",
      "Power Dialer + Call Log",
      "Unlimited Smart Plans",
      "Deal Pipeline + Transactions",
      "Social Media Scheduler",
      "Team Management (5 agents)",
      "CRM Webhooks (Salesforce, HubSpot, FUB)",
      "Custom AI Training on YOUR Listings",
      "Priority Support (24h response)",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    monthly: 1999,
    annual: 19990, // Save $3,998 (pay 10, get 2 free)
    setupFee: 4997,
    tagline: "For brokerages & large teams",
    conversations: "10,000",
    features: [
      "Everything in Professional, plus:",
      "Unlimited Widgets",
      "10,000 AI Conversations/month",
      "Unlimited Team Members",
      "Unlimited Landing Pages",
      "IDX / MLS Feed (white-glove setup)",
      "White-Label Branding",
      "Full REST API Access",
      "Dedicated Account Manager",
      "Priority Support (4h response)",
      "White-glove Onboarding Call",
      "Lower conversation overage ($0.75/convo)",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
];

const FAQS = [
  {
    q: "How does the setup fee work?",
    a: "Our one-time setup fee ($997-$2,997 depending on plan) is waived if you choose annual billing. That means you can start for $0 setup by paying annually — you save $997-$2,997 AND get 2 months free. If you prefer monthly billing, the setup fee applies once to cover your onboarding, AI training, and integration setup. Competitors charge $1,500+ setup with no waiver option at all.",
  },
  {
    q: "What if I need to pay monthly?",
    a: "Monthly billing is absolutely available. You'll just pay the one-time setup fee ($997 / $1,497 / $2,997 by plan) at signup — which still makes us cheaper Year 1 than Lofty and Drift, and competitive with Ylopo. You can switch to annual any time and we'll credit your next setup fee.",
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
    a: "We'll notify you at 80% usage. You can either upgrade to a higher plan or pay overage: $0.99 per extra conversation (billed monthly). Most clients use only 30-50% of their limit, so overage is rare.",
  },
  {
    q: "How does CloserAI compare to Ylopo, Lofty, Chime, and BoomTown?",
    a: "Year 1 cost comparison at the Professional tier: Ylopo + RAIYA ~$7,500, Lofty + AI ~$9,287, Chime ~$6,500, BoomTown $12,750, Drift $30,000+. Our Professional plan is $7,990/year with annual billing (setup waived) — competitive with Ylopo while including full CRM, email/SMS campaigns, Smart Plans, Power Dialer, Social Scheduler, 50+ languages, Home Valuations, Landing Pages, and 12+ integrations. We deliver more features than any competitor at this price point.",
  },
  {
    q: "What's your 3x ROI guarantee?",
    a: "If CloserAI doesn't deliver at least 3x return on your investment within your first 90 days, we'll extend your next 90 days free. That's not a money-back promise — it's a promise that we'll keep working for free until we earn our keep. Given that agents report 40-60% more captured leads and one closed commission pays for 10+ months, this has never been a problem.",
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
    q: "Can I try CloserAI before paying?",
    a: "Yes — every plan includes a 14-day free trial with no credit card required. You'll see your AI agent capturing and qualifying leads on your real website before you ever get billed. If it's not a fit, just don't convert — no charges, no hassle.",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">
              Closer<span className="gradient-text">AI</span>
            </span>
          </a>
          <div className="flex items-center gap-1">
            <a href="/demo" className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">Live Demo</a>
            <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">Login</a>
            <a href="/free-trial" className="ml-2 gradient-brand text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all">
              Start Trial
            </a>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

        <div className="relative text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-green-700 mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            14-day free trial · No credit card · Setup waived on annual
          </div>
          <div className="inline-flex items-center gap-2 mb-5 ml-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-700 shadow-sm">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Founder Pricing — 73 of 100 spots left
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-5">
            Simple, <span className="gradient-text-vivid">transparent</span> pricing
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            One closed real estate deal pays for a full year of CloserAI. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-1.5 shadow-premium">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                billing === "monthly" ? "gradient-brand text-white shadow-md" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
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
            <p className="text-sm text-green-600 mt-3 font-semibold">Annual billing available at checkout — pay for 10 months, get 12.</p>
          )}
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
                className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? "gradient-brand text-white shadow-2xl shadow-blue-500/30 md:scale-105 border-2 border-blue-400/30"
                    : "bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-premium-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 bg-yellow-400 text-gray-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      MOST POPULAR
                    </div>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className={`text-sm mb-5 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>{plan.tagline}</p>
                <div className="mb-1">
                  <span className="text-5xl font-bold tracking-tight">${formatNum(displayPrice)}</span>
                  <span className={`ml-1 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>/month</span>
                </div>
                <div className={`text-xs mb-2 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>
                  {billedAs}
                </div>
                {billing === "annual" ? (
                  <div className={`text-sm mb-2 font-semibold ${plan.popular ? "text-yellow-300" : "text-green-600"}`}>
                    Save ${formatNum(savings)} — pay 10 months, get 12
                  </div>
                ) : (
                  <div className={`text-sm mb-2 ${plan.popular ? "text-white/80" : "text-gray-600"}`}>
                    Or <span className="font-bold">${formatNum(plan.annual)}/yr</span> — setup fee waived
                  </div>
                )}
                <div className={`text-xs mb-6 pb-4 border-b ${plan.popular ? "border-white/20 text-white/80" : "border-gray-100 text-gray-600"}`}>
                  {billing === "annual" ? (
                    <span className={`font-semibold ${plan.popular ? "text-yellow-300" : "text-green-600"}`}>
                      Setup fee <span className="line-through opacity-60">${formatNum(plan.setupFee)}</span> <span className="font-bold">WAIVED</span>
                    </span>
                  ) : (
                    <span>
                      <span className="font-semibold">${formatNum(plan.setupFee)} one-time setup</span>
                      <span className={plan.popular ? "text-white/60" : "text-gray-400"}> — or go annual to waive it</span>
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${plan.popular ? "bg-yellow-300/20" : "bg-green-100"}`}>
                        <svg className={`w-3 h-3 ${plan.popular ? "text-yellow-300" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={plan.popular ? "text-white" : "text-gray-700"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={billing === "annual" ? "/free-trial?billing=annual" : "/free-trial"}
                  className={`block text-center py-3.5 rounded-xl font-semibold transition group ${
                    plan.popular
                      ? "bg-white text-blue-700 hover:bg-gray-50 shadow-lg"
                      : "gradient-brand text-white hover:shadow-lg hover:shadow-blue-500/25"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {plan.cta}
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </span>
                </a>
                <p className={`text-xs text-center mt-3 ${plan.popular ? "text-white/60" : "text-gray-400"}`}>
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
                    <td className="px-6 py-4 font-bold text-blue-700">$299/mo</td>
                    <td className="px-6 py-4 text-green-600 font-bold">$0 on annual</td>
                    <td className="px-6 py-4">✅ Purpose-built</td>
                    <td className="px-6 py-4">50+ languages</td>
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
            <div className="text-3xl mb-1">🎁</div>
            <h3 className="font-bold text-green-800 mb-1">14-Day Free Trial</h3>
            <p className="text-sm text-green-700">Try every feature. No credit card required.</p>
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
          <p className="text-sm text-white/60 mt-4">Questions? Email <a href="https://mail.google.com/mail/?view=cm&to=AbdelrahmanAbdelati20@gmail.com" target="_blank" rel="noopener" className="underline">AbdelrahmanAbdelati20@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
}
