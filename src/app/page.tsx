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
  { value: "3x", label: "More Leads Captured" },
  { value: "<2s", label: "Response Time" },
  { value: "89%", label: "Lead Satisfaction" },
];

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Broker, Premier Realty Group",
    text: "CloserAI doubled our lead conversion in the first month. It's like having a top agent working the phones 24/7.",
  },
  {
    name: "James Rodriguez",
    role: "Team Lead, Coastal Properties",
    text: "We were losing leads at night and on weekends. CloserAI captures every single one now. Best investment we've made.",
  },
  {
    name: "Amanda Chen",
    role: "Owner, Pacific Heights Real Estate",
    text: "The AI knows our listings inside and out. Clients are amazed at how quickly they get matched with the perfect property.",
  },
];

export default function LandingPage() {
  const [demoMessages, setDemoMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI assistant at Sunshine Realty. Looking to buy, sell, or just exploring? I'd love to help!" },
  ]);
  const [demoInput, setDemoInput] = useState("");

  const handleDemo = () => {
    if (!demoInput.trim()) return;
    const userMsg = demoInput;
    setDemoInput("");
    setDemoMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setTimeout(() => {
      setDemoMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Great question! I'd love to help you find the perfect property. Could you tell me your name so I can personalize your search? Also, what area are you most interested in?",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-brand-900">
              Closer<span className="text-brand-600">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-brand-600 transition">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-brand-600 transition">Pricing</a>
            <a href="#demo" className="text-gray-600 hover:text-brand-600 transition">Demo</a>
            <Link href="/pricing" className="text-gray-600 hover:text-brand-600 transition">Login</Link>
            <a href="#pricing" className="gradient-brand text-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
            Trusted by 500+ Real Estate Professionals
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Never Lose Another
            <br />
            <span className="text-transparent bg-clip-text" style={{backgroundImage: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"}}>Real Estate Lead</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            CloserAI is your 24/7 AI-powered sales agent that captures, qualifies, and
            converts website visitors into ready-to-close leads — while you sleep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href="#pricing" className="gradient-brand text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition shadow-lg shadow-brand-600/25">
              Start Converting Leads Today
            </a>
            <a href="#demo" className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-brand-300 transition">
              See Live Demo
            </a>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-brand-700">{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
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
                title: "ROI Guaranteed",
                desc: "On average, our clients see 3x more leads captured and 40% higher conversion rates. The AI pays for itself within the first week.",
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
            <div className="h-80 overflow-y-auto p-4 space-y-3">
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
            </div>
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDemo()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              />
              <button
                onClick={handleDemo}
                className="gradient-brand text-white px-4 py-2 rounded-xl hover:opacity-90 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-brand-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Top Real Estate Professionals</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/80 mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-white/50 text-sm">{t.role}</div>
                </div>
              </div>
            ))}
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
                  href="/pricing"
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
          <h2 className="text-4xl font-bold mb-6">Ready to 3x Your Real Estate Leads?</h2>
          <p className="text-xl text-white/80 mb-10">
            Join hundreds of top-performing agents and brokerages already using CloserAI.
            Set up in 5 minutes. See results in 24 hours.
          </p>
          <a
            href="#pricing"
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
