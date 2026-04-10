"use client";

import Link from "next/link";
import { useState } from "react";

const PLANS = [
  {
    name: "Starter",
    price: 297,
    setup: 997,
    features: [
      "1 Website Widget",
      "500 AI Conversations/month",
      "Lead Capture & Management",
      "Email Notifications",
      "Basic Analytics Dashboard",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: 597,
    setup: 997,
    features: [
      "5 Website Widgets",
      "2,000 AI Conversations/month",
      "Advanced Lead Scoring",
      "Property Matching AI",
      "CRM Integration Ready",
      "Priority Support",
    ],
    cta: "Most Popular",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 1497,
    setup: 1497,
    features: [
      "Unlimited Widgets",
      "Unlimited AI Conversations",
      "Custom AI Training",
      "White-Label Option",
      "Full API Access",
      "Dedicated Account Manager",
      "Custom Integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const STATS = [
  { value: "24/7", label: "Always Online" },
  { value: "50+", label: "Languages" },
  { value: "<2s", label: "Response Time" },
  { value: "5 min", label: "Setup Time" },
];

// Demo uses the real AI — powered by Claude
const DEMO_API_KEY = "cai_44d60f6ac0e849d78060792f010730ed";

export default function LandingPage() {
  const [demoMessages, setDemoMessages] = useState([
    { role: "assistant", content: "Hi there! I'm Sarah, your AI real estate assistant at Sunshine Realty. Whether you're looking to buy, sell, or just exploring — I'm here to help! What are you looking for?" },
  ]);
  const [demoInput, setDemoInput] = useState("");
  const [demoConvId, setDemoConvId] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemo = async () => {
    if (!demoInput.trim() || demoLoading) return;
    const userMsg = demoInput;
    setDemoInput("");
    setDemoMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setDemoLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: DEMO_API_KEY,
          conversationId: demoConvId,
          message: userMsg,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setDemoMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having a brief moment — try again!" }]);
      } else {
        setDemoConvId(data.conversationId);
        setDemoMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      }
    } catch {
      setDemoMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again!" }]);
    }
    setDemoLoading(false);
  };

  return (
    <div className="min-h-screen">
      {/* TRIAL BANNER */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-2.5 text-sm font-semibold fixed top-0 w-full z-50">
        <Link href="/free-trial" className="hover:underline">
          LIMITED TIME: Get your AI assistant FREE for 14 days — No credit card required &rarr;
        </Link>
      </div>

      {/* Navigation */}
      <nav className="fixed top-10 w-full bg-white/90 backdrop-blur-md z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-brand-900">
              Closer<span className="text-brand-600">AI</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="#features" className="text-gray-600 hover:text-brand-600 transition">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-brand-600 transition">Pricing</a>
            <a href="/demo" className="text-gray-600 hover:text-brand-600 transition">Demo</a>
            <Link href="/login" className="text-gray-600 hover:text-brand-600 transition">Login</Link>
            <Link href="/free-trial" className="gradient-brand text-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition">
              Free Trial
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <Link href="/demo" className="text-sm text-gray-600 hover:text-brand-600 transition">Demo</Link>
            <Link href="/free-trial" className="gradient-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
              Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 sm:pt-44 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-5 sm:mb-6 px-4 py-1 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm font-medium">
            14-Day Free Trial · No Credit Card Required
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-5 sm:mb-6">
            Never Lose Another
            <br />
            <span className="text-transparent bg-clip-text" style={{backgroundImage: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"}}>Real Estate Lead</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            CloserAI is your 24/7 AI-powered sales agent that captures, qualifies, and
            converts website visitors into ready-to-close leads — while you sleep.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
            <a href="/free-trial" className="gradient-brand text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:opacity-90 transition shadow-lg shadow-brand-600/25">
              Start Free 14-Day Trial
            </a>
            <a href="/demo" className="border-2 border-gray-200 text-gray-700 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:border-brand-300 transition">
              See Live Demo
            </a>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-2xl sm:text-3xl font-bold text-brand-700">{s.value}</div>
                <div className="text-gray-500 text-xs sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Close More Deals</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              One AI-powered platform that handles lead capture, qualification, and nurturing automatically.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
                title: "24/7 AI Chat Agent",
                desc: "Your AI agent responds instantly to every visitor, day or night. It understands property needs, answers questions, and guides prospects through their journey.",
              },
              {
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                title: "Smart Lead Capture",
                desc: "Automatically captures names, emails, phone numbers, budgets, and preferences through natural conversation. No forms, no friction.",
              },
              {
                icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
                title: "Property Matching",
                desc: "Upload your listings and the AI automatically matches visitors with properties that fit their criteria. Smart recommendations that close deals.",
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Lead Dashboard",
                desc: "See all your leads in one place with status tracking, conversation history, contact details, and lead scoring. Know exactly who's ready to buy.",
              },
              {
                icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
                title: "Easy Setup",
                desc: "Copy-paste one line of code onto your website. That's it. Your AI agent is live in under 5 minutes. No technical skills needed.",
              },
              {
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Risk-Free Trial",
                desc: "14 days free, no credit card required. Test it on your own website, see if it captures more leads, then decide. Cancel anytime.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">See CloserAI in Action</h2>
            <p className="text-gray-600 text-lg">Try chatting with our demo agent below</p>
          </div>
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border">
            <div className="gradient-brand p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">S</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah - Sunshine Realty</div>
                  <div className="text-xs text-white/70">Online now</div>
                </div>
              </div>
            </div>
            <div id="demo-chat-area" className="h-80 overflow-y-auto p-4 space-y-3">
              {demoMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      m.role === "user"
                        ? "bg-brand-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {demoLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDemo()}
                placeholder={demoLoading ? "Sarah is typing..." : "Try it! Ask about homes in Miami..."}
                disabled={demoLoading}
                className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-brand-500 outline-none text-sm disabled:opacity-50"
              />
              <button
                onClick={handleDemo}
                disabled={demoLoading}
                className="gradient-brand text-white px-4 py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {demoLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Real Estate Section */}
      <section className="py-20 px-6 bg-brand-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built Specifically for Real Estate</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Not a generic chatbot. Every feature is designed for how real estate agents actually work.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Property Matching AI</h3>
              <p className="text-white/70">AI knows your listings inside-out. When visitors describe what they want, it recommends the perfect match automatically.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Hot Lead Scoring</h3>
              <p className="text-white/70">AI automatically scores every lead as hot, warm, or cold based on timeline, budget, and pre-approval status. Know who to call first.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">50+ Languages</h3>
              <p className="text-white/70">Automatically detects and responds in Spanish, Chinese, French, Arabic, and 46 other languages. Perfect for international buyers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 text-lg">One-time setup fee + monthly subscription. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? "gradient-brand text-white shadow-2xl shadow-brand-600/25 scale-105"
                    : "bg-white border-2 border-gray-100 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="text-xs font-bold uppercase tracking-wider mb-4 text-yellow-300">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <div className="mb-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className={plan.popular ? "text-white/70" : "text-gray-500"}>/month</span>
                </div>
                <div className={`text-sm mb-6 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>
                  + ${plan.setup} one-time setup
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <svg className={`w-5 h-5 flex-shrink-0 ${plan.popular ? "text-yellow-300" : "text-green-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/get-started"
                  className={`block text-center py-3 rounded-xl font-semibold transition ${
                    plan.popular
                      ? "bg-white text-brand-700 hover:bg-gray-100"
                      : "gradient-brand text-white hover:opacity-90"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 gradient-brand">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Stop Losing Leads While You Sleep</h2>
          <p className="text-xl text-white/80 mb-10">
            Install CloserAI on your website in 5 minutes. Your AI assistant starts
            capturing leads 24/7 immediately. Free for 14 days, no credit card required.
          </p>
          <a
            href="/free-trial"
            className="inline-block bg-white text-brand-700 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition shadow-xl"
          >
            Start Your Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-950 text-white/60 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 gradient-brand rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="font-bold text-white">CloserAI</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Support</a>
          </div>
          <div className="text-sm">&copy; {new Date().getFullYear()} CloserAI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
