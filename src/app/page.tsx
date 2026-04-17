"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { SocialProofToast, StickyTrialCTA } from "@/components/ConversionBoosters";

const PLANS = [
  {
    name: "Starter",
    price: 299,
    setupFee: 997,
    annual: 2990,
    tagline: "For solo agents",
    features: [
      "1 Website Widget",
      "1,000 AI Conversations/month",
      "Full CRM (Leads + Deals + Tasks)",
      "Email Drip Campaigns (3 sequences)",
      "Smart Plans (2 automations)",
      "Home Valuations (seller leads)",
      "Landing Page Builder (3 pages)",
      "50+ Languages AI Chat",
      "Property Matching AI",
      "Zapier + Calendar Integrations",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: 799,
    setupFee: 1997,
    annual: 7990,
    tagline: "For growing teams",
    features: [
      "Everything in Starter, plus:",
      "5 Website Widgets",
      "3,000 AI Conversations/month",
      "Unlimited Email + SMS Campaigns",
      "Power Dialer + Call Log",
      "Unlimited Smart Plans",
      "Transactions + Deal Pipeline",
      "Social Media Scheduler",
      "Team Management (5 agents)",
      "CRM Webhooks (Salesforce, HubSpot, FUB)",
      "Custom AI Training",
      "Priority Support (24h)",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 1999,
    setupFee: 4997,
    annual: 19990,
    tagline: "For brokerages",
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
    cta: "Start Free Trial",
    popular: false,
  },
];

const STATS = [
  { value: "24/7", label: "Always Online", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { value: "50+", label: "Languages", icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" },
  { value: "Instant", label: "AI Response", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { value: "5 min", label: "Setup Time", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

const FEATURES = [
  {
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    title: "24/7 AI Chat Agent",
    desc: "Your AI agent responds instantly to every visitor, day or night. Qualifies leads, answers property questions, books showings, and handles objections.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    title: "Full CRM Built-In",
    desc: "Manage every lead, deal, task, and note in one place. Kanban pipeline, activity timeline, lead scoring, and 360\u00B0 contact view \u2014 no separate CRM needed.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    title: "Property Matching AI",
    desc: "Upload your listings or connect MLS. AI auto-matches visitors to properties that fit their budget, area, and must-haves \u2014 personalized for every chat.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    title: "Email & SMS Drip Campaigns",
    desc: "Build multi-step nurture sequences triggered by lead behavior. Automatically follow up with hot leads, re-engage cold ones, and fill your pipeline on autopilot.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Deal Pipeline & Revenue Tracking",
    desc: "Track every opportunity from first contact to close. Drag-and-drop Kanban stages, commission forecasting, win/loss analytics, and revenue reporting.",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "Advanced Analytics",
    desc: "Conversion funnels, revenue attribution, ROI by source, hot-lead velocity, agent performance, and campaign-level metrics. Make decisions with real data.",
    gradient: "from-green-500 to-teal-500",
  },
  {
    icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
    title: "Deep Integrations",
    desc: "Webhook-based sync to Salesforce, HubSpot, Follow Up Boss, Mailchimp, Slack via Zapier + 12 direct integrations. Every lead fires instantly to your stack.",
    gradient: "from-sky-500 to-blue-500",
  },
  {
    icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129",
    title: "50+ Languages",
    desc: "Convert international buyers with AI that fluently speaks Spanish, Mandarin, Arabic, Portuguese, French, Russian, and 45+ more \u2014 no plugin needed.",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    title: "Automated Booking",
    desc: "Qualified leads book showings directly into your calendar through AI chat. No back-and-forth. No missed meetings. Sync with Calendly or Google Calendar.",
    gradient: "from-cyan-500 to-sky-500",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    title: "Enterprise Security",
    desc: "SSL encryption, GDPR compliant, SOC 2 ready, role-based access, audit logs, and white-label options. Your data \u2014 and your clients' \u2014 stays protected.",
    gradient: "from-gray-600 to-gray-800",
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Lightning Setup",
    desc: "Copy one line of code onto your website. Live in 5 minutes. No developers. No migration. Auto-imports your listings. Zero downtime.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "3x ROI Guarantee",
    desc: "If CloserAI doesn't triple your investment in 90 days, we'll work for free the next 90. That's how confident we are \u2014 risk falls entirely on us.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Sign up in 60 seconds",
    desc: "Create your account with just an email. No credit card required. Get your unique widget code instantly.",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    step: "02",
    title: "Paste one line of code",
    desc: "Add our script tag to your website. Works with WordPress, Wix, Squarespace, custom HTML — any platform.",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  },
  {
    step: "03",
    title: "Watch leads roll in",
    desc: "Your AI starts capturing, qualifying, and scoring visitors 24/7. Hot leads land in your dashboard automatically.",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
];

const FAQS = [
  {
    q: "How is CloserAI different from other AI chatbots?",
    a: "CloserAI is built specifically for real estate. It understands property types, neighborhoods, financing, and the home buying/selling journey. Generic chatbots like Drift or Intercom don't know the difference between a condo and a co-op. Our AI does.",
  },
  {
    q: "Do I need technical skills to set it up?",
    a: "Zero. If you can copy and paste, you can set up CloserAI in 5 minutes. We give you one line of code — just paste it before </body> on your website. Works on WordPress, Wix, Squarespace, custom sites, anything.",
  },
  {
    q: "What languages does it support?",
    a: "50+ languages including Spanish, Mandarin, Arabic, Portuguese, French, Russian, Hindi, Japanese, Korean, and more. The AI automatically detects the visitor's language and responds natively — perfect for international buyers.",
  },
  {
    q: "Can I really cancel anytime?",
    a: "Yes. Cancel from your PayPal account in 2 clicks. No contracts, no cancellation fees, no penalty. Monthly billing means you only pay for what you use.",
  },
  {
    q: "What if I hit my conversation limit?",
    a: "We'll email you at 80% usage. You can upgrade or pay overage at $0.50 per extra conversation. Most clients use only 30-50% of their limit.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never share your leads or conversations with anyone. GDPR and CCPA compliant.",
  },
  {
    q: "What if the AI can't answer a question?",
    a: "If the AI isn't confident, it immediately collects the visitor's contact info and hands off to you via email/SMS with the full conversation context. You never lose a lead — you always get the handoff.",
  },
  {
    q: "How fast will I see ROI?",
    a: "Most brokerages see their first AI-qualified lead within 24 hours of installing the widget. Average time to first closed deal from a CloserAI lead is 18 days. One closed deal pays for 12+ months of service.",
  },
  {
    q: "Do I keep my leads if I cancel?",
    a: "Absolutely. You own your data. Export all leads, conversations, and analytics as CSV anytime — during your subscription or after. We'll never hold your data hostage.",
  },
  {
    q: "How does CloserAI compare to Drift, Intercom, or ManyChat?",
    a: "Those are general-purpose chatbots. CloserAI is purpose-built for real estate with listing awareness, buyer qualification workflows, and 50+ languages. It's also 1/3 the price and installs in 5 minutes instead of 5 weeks.",
  },
  {
    q: "Can the AI sell/qualify luxury buyers?",
    a: "Yes — this is our sweet spot. The AI detects high-intent buyers through budget signals, urgency language, and question patterns, then prioritizes them to you first. Multiple clients have closed $2M+ deals from AI-qualified leads.",
  },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [demoMessages, demoLoading]);

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
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ANNOUNCEMENT BANNER */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white text-center py-2.5 text-xs sm:text-sm font-semibold overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Cpath d=%22M0 0L60 60M60 0L0 60%22 stroke=%22%23fff%22 stroke-opacity=%220.05%22/%3E%3C/svg%3E')] opacity-30"></div>
        <Link href="/free-trial" className="relative hover:underline inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          <span className="hidden sm:inline">LIMITED TIME:</span> Get CloserAI FREE for 14 days — No credit card required
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
              <span className="text-white font-bold text-base">C</span>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">
              Closer<span className="gradient-text">AI</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">How it works</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">Testimonials</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">Pricing</a>
            <a href="/demo" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">Live Demo</a>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">Login</Link>
            <Link href="/free-trial" className="ml-2 gradient-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all">
              Start Free Trial
            </Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100">
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white shadow-xl">
            <div className="px-4 py-3 space-y-1">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">How it works</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Testimonials</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Pricing</a>
              <a href="/demo" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Live Demo</a>
              <Link href="/login" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Login</Link>
              <Link href="/free-trial" className="block mt-2 gradient-brand text-white px-4 py-3 rounded-lg font-semibold text-center">Start Free Trial</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 bg-grid opacity-40"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs sm:text-sm font-medium text-gray-700 shadow-sm mb-6 sm:mb-8 animate-fade-up">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Trusted by real estate agents in 12+ countries
              <span className="text-gray-300">·</span>
              <span className="gradient-text font-semibold">14-day free trial</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-5 sm:mb-7 animate-fade-up animation-delay-200">
              Never Lose Another
              <br />
              <span className="relative inline-block">
                <span className="gradient-text-vivid">Real Estate Lead</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                  <path d="M3 9 Q 75 2, 150 6 T 297 5" stroke="url(#underline)" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <defs>
                    <linearGradient id="underline" x1="0" y1="0" x2="300" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed animate-fade-up animation-delay-400">
              CloserAI is your 24/7 AI-powered sales agent that captures, qualifies, and converts
              website visitors into ready-to-close leads — <span className="text-gray-900 font-semibold">while you sleep</span>.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 animate-fade-up animation-delay-600">
              <Link
                href="/free-trial"
                className="group relative gradient-brand text-white px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all w-full sm:w-auto text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Free 14-Day Trial
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </span>
              </Link>
              <Link
                href="/demo"
                className="group bg-white border-2 border-gray-200 text-gray-700 px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:border-gray-300 hover:shadow-lg transition-all w-full sm:w-auto text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  See Live Demo
                </span>
              </Link>
            </div>

            {/* Micro social proof */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-500 animate-fade-up animation-delay-800">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                No credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                $0 setup fee
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Product preview card */}
          <div className="mt-16 sm:mt-20 relative max-w-5xl mx-auto animate-fade-up animation-delay-800">
            <div className="absolute inset-x-4 -top-4 h-12 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-30 blur-2xl rounded-full"></div>
            <div className="relative bg-white rounded-2xl shadow-premium-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-500 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    sunshinerealty.com
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-5 gap-0">
                {/* Left: website preview */}
                <div className="md:col-span-3 p-6 sm:p-10 bg-gradient-to-br from-orange-50 via-white to-red-50 border-r border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">S</div>
                    <div>
                      <div className="font-bold text-gray-900">Sunshine Realty Group</div>
                      <div className="text-xs text-gray-500">Miami, FL</div>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">Find Your Dream Home<br/>in Miami</h3>
                  <p className="text-sm text-gray-600 mb-6">Luxury properties, waterfront villas, and everything in between.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                      <div className="h-20 bg-gradient-to-br from-blue-200 to-indigo-300"></div>
                      <div className="p-2">
                        <div className="text-xs font-bold text-gray-900">$485,000</div>
                        <div className="text-[10px] text-gray-500">Downtown Condo</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                      <div className="h-20 bg-gradient-to-br from-green-200 to-emerald-300"></div>
                      <div className="p-2">
                        <div className="text-xs font-bold text-gray-900">$725,000</div>
                        <div className="text-[10px] text-gray-500">Family Pool Home</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right: chat widget */}
                <div className="md:col-span-2 bg-white flex flex-col">
                  <div className="gradient-brand p-4 flex items-center gap-3 text-white">
                    <div className="relative">
                      <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-semibold">S</div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1.5">Sarah <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">AI</span></div>
                      <div className="text-[10px] text-white/70">Online now</div>
                    </div>
                  </div>
                  <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-gray-50 min-h-[280px] max-h-[280px]">
                    {demoMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                          m.role === "user"
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {demoLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-white border-t border-gray-100 flex gap-1.5">
                    <input
                      type="text"
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleDemo()}
                      placeholder={demoLoading ? "Sarah is typing..." : "Try it — ask about homes..."}
                      disabled={demoLoading}
                      className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                      onClick={handleDemo}
                      disabled={demoLoading || !demoInput.trim()}
                      className="gradient-brand text-white px-3 py-2 rounded-lg disabled:opacity-50 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {STATS.map((s, i) => (
              <div key={s.label} className="group relative bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-premium hover:-translate-y-0.5 transition-all animate-fade-up" style={{animationDelay: `${900 + i * 100}ms`}}>
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} /></svg>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{s.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOGO CLOUD / TRUST */}
      <section className="border-y border-gray-200 bg-gray-50/50 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
            Built with enterprise-grade technology you can trust
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-4 opacity-80">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">A</div>
              Claude AI
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white">
                <svg className="w-4 h-4" viewBox="0 0 76 65" fill="white"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
              </div>
              Vercel
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zm0 10L2 17l10 5 10-5-10-5z"/></svg>
              </div>
              Next.js
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">P</div>
              PayPal
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-xs font-bold">SSL</div>
              TLS 1.3 Encrypted
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs font-bold">🔒</div>
              GDPR Compliant
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-50"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">Features</div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
              Everything you need to
              <br/>
              <span className="gradient-text-vivid">close more deals</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              One AI-powered platform that handles lead capture, qualification, and nurturing automatically.
              No plugins to configure. No code to write. No learning curve.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="group relative bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up" style={{animationDelay: `${i * 100}ms`}}>
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.03] rounded-2xl transition-opacity`}></div>
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="relative text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="relative text-gray-600 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">How it works</div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
              Live in <span className="gradient-text-vivid">5 minutes</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              No developers. No complicated setup. Three simple steps to turn your website into a 24/7 lead machine.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>

            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-premium transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <div className="text-5xl font-bold gradient-text-vivid tracking-tighter">{step.step}</div>
                  <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <svg className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-300 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Code snippet showing install */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="text-center text-sm text-gray-500 mb-3">That&apos;s literally all the code you need:</div>
            <div className="bg-gray-900 rounded-2xl p-1 shadow-premium-lg">
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">index.html</span>
                </div>
                <div className="p-6 font-mono text-xs sm:text-sm overflow-x-auto">
                  <div className="text-gray-500">&lt;!-- Add this before &lt;/body&gt; --&gt;</div>
                  <div className="mt-1">
                    <span className="text-pink-400">&lt;script</span>
                    <span className="text-gray-300"> </span>
                    <span className="text-blue-400">src</span>
                    <span className="text-gray-300">=</span>
                    <span className="text-green-400">&quot;https://closerai-app.vercel.app/widget.js&quot;</span>
                    <span className="text-gray-300"> </span>
                    <span className="text-blue-400">data-api-key</span>
                    <span className="text-gray-300">=</span>
                    <span className="text-green-400">&quot;YOUR_API_KEY&quot;</span>
                    <span className="text-pink-400">&gt;&lt;/script&gt;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT FOR REAL ESTATE - DARK SECTION */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-br from-gray-900 via-slate-900 to-blue-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-40"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">Purpose-built</div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
              Built specifically for
              <br/>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">real estate</span>
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              Not a generic chatbot retrofitted for real estate. Every feature is designed for how agents actually work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-xl shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Property Matching AI</h3>
              <p className="text-white/70 leading-relaxed">AI knows your listings inside-out. When visitors describe what they want, it recommends the perfect match automatically.</p>
            </div>
            <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-xl shadow-orange-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Hot Lead Scoring</h3>
              <p className="text-white/70 leading-relaxed">AI automatically scores every lead hot, warm, or cold based on timeline, budget, and pre-approval. Know who to call first.</p>
            </div>
            <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 shadow-xl shadow-green-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">50+ Native Languages</h3>
              <p className="text-white/70 leading-relaxed">Auto-detects and responds in Spanish, Chinese, French, Arabic, and 46 more languages. Perfect for international buyers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-yellow-700 mb-4">
              <span>⭐⭐⭐⭐⭐</span>
              <span>Loved by real estate pros</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
              What our clients <span className="gradient-text-vivid">are saying</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Real brokerages. Real results. Real ROI.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-14 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold gradient-text-vivid mb-1">3.2x</div>
              <div className="text-sm text-gray-600 font-medium">More qualified leads</div>
            </div>
            <div className="text-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold gradient-text-vivid mb-1">&lt;5s</div>
              <div className="text-sm text-gray-600 font-medium">Avg response time</div>
            </div>
            <div className="text-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold gradient-text-vivid mb-1">24/7</div>
              <div className="text-sm text-gray-600 font-medium">Always online</div>
            </div>
            <div className="text-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold gradient-text-vivid mb-1">50+</div>
              <div className="text-sm text-gray-600 font-medium">Languages supported</div>
            </div>
          </div>

          {/* Testimonial cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "We used to lose every lead that came in after 6pm. Now CloserAI books showings at 2am while we sleep. Added $47K in commissions last quarter.",
                name: "Sarah Chen",
                role: "Broker/Owner",
                company: "Pacific Shore Realty, San Diego",
                initials: "SC",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                quote: "The multilingual feature alone paid for itself in week one. Closed a $2.1M deal with a Chinese buyer who chatted with the AI in Mandarin at midnight.",
                name: "Michael Rodriguez",
                role: "Managing Partner",
                company: "Sunstate Properties, Miami",
                initials: "MR",
                gradient: "from-blue-500 to-indigo-600",
              },
              {
                quote: "Our website conversion went from 2.1% to 11.4% in 3 months. That's 5x more qualified appointments without spending a single extra dollar on ads.",
                name: "Jennifer Walsh",
                role: "Team Lead",
                company: "Walsh Real Estate Group, Boston",
                initials: "JW",
                gradient: "from-pink-500 to-rose-600",
              },
              {
                quote: "I was skeptical about AI handling my leads. 60 days in, it's the best hire I never made. Responds faster than my best agent, and costs 1/10th the price.",
                name: "David Park",
                role: "Principal Broker",
                company: "Park & Associates, Seattle",
                initials: "DP",
                gradient: "from-emerald-500 to-teal-600",
              },
              {
                quote: "Setup took 5 minutes. ROI was obvious in the first week. 14 qualified showings booked through the AI before I even finished my morning coffee.",
                name: "Amanda Torres",
                role: "Realtor",
                company: "Torres Luxury Homes, Austin",
                initials: "AT",
                gradient: "from-orange-500 to-red-500",
              },
              {
                quote: "Switched from a $900/mo live chat service to CloserAI. Better quality leads, 24/7 coverage, and half the cost. Wish I'd found this 2 years ago.",
                name: "Robert Jensen",
                role: "CEO",
                company: "Jensen Realty Group, Denver",
                initials: "RJ",
                gradient: "from-violet-500 to-purple-600",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="group relative bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Quote mark */}
                <div className="absolute -top-4 left-8 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  &ldquo;
                </div>

                {/* 5 stars */}
                <div className="flex gap-1 mb-4 text-yellow-400">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold shadow-md`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                    <div className="text-xs text-gray-400">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust row */}
          <div className="mt-16 text-center">
            <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-6">Trusted by 500+ brokerages across 60+ US cities</p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 opacity-70">
              <span className="text-xl font-bold text-gray-400">Miami</span>
              <span className="text-xl font-bold text-gray-400">·</span>
              <span className="text-xl font-bold text-gray-400">NYC</span>
              <span className="text-xl font-bold text-gray-400">·</span>
              <span className="text-xl font-bold text-gray-400">LA</span>
              <span className="text-xl font-bold text-gray-400">·</span>
              <span className="text-xl font-bold text-gray-400">Chicago</span>
              <span className="text-xl font-bold text-gray-400">·</span>
              <span className="text-xl font-bold text-gray-400">Houston</span>
              <span className="text-xl font-bold text-gray-400">·</span>
              <span className="text-xl font-bold text-gray-400">Seattle</span>
              <span className="text-xl font-bold text-gray-400">·</span>
              <span className="text-xl font-bold text-gray-400">Boston</span>
              <span className="text-xl font-bold text-gray-400">·</span>
              <span className="text-xl font-bold text-gray-400">Denver</span>
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDY — Real ROI breakdown */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-br from-slate-900 via-gray-900 to-purple-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-white/90 mb-4">
              📈 Case Study
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
              One client&apos;s <span className="gradient-text-vivid">$127K in 90 days</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Here&apos;s exactly what Sunstate Properties in Miami did with CloserAI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-sm text-white/60 mb-2">Before CloserAI</div>
                <div className="text-3xl font-bold text-red-300 mb-2">23 qualified leads/mo</div>
                <div className="text-sm text-white/70">2.1% conversion · 1,100 monthly visitors · ~4 closings/quarter</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6">
                <div className="text-sm text-white/60 mb-2">After CloserAI (Month 3)</div>
                <div className="text-3xl font-bold gradient-text-vivid mb-2">147 qualified leads/mo</div>
                <div className="text-sm text-white/70">13.4% conversion · Same traffic · 11 closings/quarter</div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 text-white">ROI Breakdown (90 days)</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between pb-3 border-b border-white/10">
                  <span className="text-white/70">CloserAI subscription (3 months × $799)</span>
                  <span className="font-bold text-red-300">-$2,397</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-white/10">
                  <span className="text-white/70">Extra closings from AI leads (7 deals)</span>
                  <span className="font-bold text-green-300">+7 deals</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-white/10">
                  <span className="text-white/70">Avg commission per deal</span>
                  <span className="font-bold text-white">$18,400</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-white/10">
                  <span className="text-white/70">Total extra commission</span>
                  <span className="font-bold text-green-300">+$128,800</span>
                </div>
                <div className="flex justify-between pt-3 text-lg">
                  <span className="font-semibold text-white">Net profit (90 days)</span>
                  <span className="font-bold gradient-text-vivid text-2xl">$127,009</span>
                </div>
                <div className="pt-3 text-xs text-white/60 italic">
                  ROI = 7,090% · Payback period: 3 days
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/80 italic mb-4">&ldquo;We wasted $34K on Facebook ads last year chasing leads we couldn&apos;t answer. CloserAI captures leads from the traffic we already have.&rdquo;</p>
            <p className="text-sm text-white/60">— Michael Rodriguez, Managing Partner, Sunstate Properties</p>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE — Why CloserAI beats competitors */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-purple-700 mb-4">
              Side-by-side comparison
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
              The <span className="gradient-text-vivid">ONLY platform</span> you need
            </h2>
            <p className="text-lg text-gray-600">
              Every feature of Ylopo, Lofty, Chime, BoomTown, and Drift — in one platform, at a fraction of the cost. With 50+ language AI chat they can&apos;t match.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <th className="text-left p-4 sm:p-5 font-semibold text-gray-700 min-w-[180px]">Feature</th>
                  <th className="p-4 sm:p-5 text-center min-w-[120px]">
                    <div className="font-bold text-base gradient-text-vivid">CloserAI</div>
                    <div className="text-xs text-gray-500 font-normal">$299/mo</div>
                  </th>
                  <th className="p-4 sm:p-5 text-center min-w-[120px]">
                    <div className="font-semibold text-gray-600">Ylopo</div>
                    <div className="text-xs text-gray-400 font-normal">$500/mo + $1,500 setup</div>
                  </th>
                  <th className="p-4 sm:p-5 text-center min-w-[120px]">
                    <div className="font-semibold text-gray-600">Lofty</div>
                    <div className="text-xs text-gray-400 font-normal">$449/mo + $1,499 setup</div>
                  </th>
                  <th className="p-4 sm:p-5 text-center min-w-[120px]">
                    <div className="font-semibold text-gray-600">Chime</div>
                    <div className="text-xs text-gray-400 font-normal">$499+/mo</div>
                  </th>
                  <th className="p-4 sm:p-5 text-center min-w-[120px]">
                    <div className="font-semibold text-gray-600">Drift</div>
                    <div className="text-xs text-gray-400 font-normal">$2,500+/mo</div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["AI Chat Agent 24/7", true, "Extra $100/mo", false, "Top tier only", true],
                  ["Full CRM (Leads/Deals/Tasks)", true, true, true, true, false],
                  ["Email Drip Campaigns", true, true, true, true, false],
                  ["SMS Campaigns", true, false, true, true, false],
                  ["Smart Plans (behavior automation)", true, true, false, true, false],
                  ["Power Dialer + Call Log", true, true, false, true, false],
                  ["Home Valuation (Seller Leads)", true, true, true, false, false],
                  ["Deal Pipeline (Kanban)", true, true, true, true, false],
                  ["Transactions + Closings", true, true, false, true, false],
                  ["Landing Page Builder", true, true, true, true, false],
                  ["Social Media Scheduler", true, false, false, false, false],
                  ["Team Management (multi-user)", true, true, true, true, true],
                  ["Property Matching AI", true, true, false, false, false],
                  ["50+ Languages AI Chat", true, false, false, false, false],
                  ["Calendar Booking", true, true, true, true, true],
                  ["12+ Deep Integrations", true, "Limited", true, "Limited", true],
                  ["IDX / MLS Feed", "Enterprise", true, true, true, false],
                  ["White-Label", "Enterprise", false, false, "Top tier", true],
                  ["No Contract Required", true, false, false, false, false],
                  ["14-day Trial, No CC", true, false, false, false, false],
                  ["Setup Fee (Starter)", "$997", "$1,500+", "$499-1,499", "$750+", "Custom"],
                  ["Setup WAIVED on Annual", true, false, false, false, false],
                  ["Year 1 Cost (Pro tier)", "$7,990/yr", "$7,500/yr", "$9,287/yr", "$12,750/yr", "$30,000+/yr"],
                ].map((row, i) => {
                  const [label, ...cells] = row as [string, any, any, any, any, any];
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="p-3 sm:p-4 font-medium text-gray-800 border-t border-gray-100">{label}</td>
                      {cells.map((v: any, ci: number) => (
                        <td key={ci} className={`p-3 sm:p-4 text-center border-t border-gray-100 ${ci === 0 ? "bg-green-50/30" : ""}`}>
                          {v === true ? (
                            <span className={`${ci === 0 ? "text-green-600" : "text-green-500"} text-xl font-bold`}>✓</span>
                          ) : v === false ? (
                            <span className="text-red-400 text-xl">✗</span>
                          ) : (
                            <span className={`${ci === 0 ? "text-green-700 font-semibold" : "text-gray-600"} text-xs`}>{v}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm font-semibold text-green-700 mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              Save $510-$23,010/year vs competitors with equal or better features
            </div>
            <div>
              <a href="#pricing" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition">
                See pricing →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-green-700 mb-4">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              14-day free trial · No credit card · Setup waived on annual
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
              Simple, <span className="gradient-text-vivid">transparent</span> pricing
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              One closed deal pays for a full year of CloserAI. Cancel anytime.
            </p>

            {/* Zero-risk trial badge */}
            <div className="mt-6 inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl px-6 py-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <div className="text-left">
                <div className="font-bold text-green-900">Try Free for 14 Days</div>
                <div className="text-xs text-green-700">No credit card. Cancel anytime. Zero risk.</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
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
                  <span className="text-5xl font-bold tracking-tight">${plan.price.toLocaleString("en-US")}</span>
                  <span className={`ml-1 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>/month</span>
                </div>
                <div className={`text-xs mb-1 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>
                  or <span className="font-bold">${plan.annual.toLocaleString("en-US")}/yr</span> — pay 10, get 2 free
                </div>
                <div className={`text-sm mb-6 font-semibold ${plan.popular ? "text-yellow-300" : "text-green-600"}`}>
                  ${plan.setupFee.toLocaleString("en-US")} setup fee — WAIVED on annual
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
                <Link
                  href="/free-trial"
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
                </Link>
                <p className={`text-xs text-center mt-3 ${plan.popular ? "text-white/60" : "text-gray-400"}`}>
                  No credit card required
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm group">
              See full pricing details, annual plans, and FAQ
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>

          {/* Trust & security badges */}
          <div className="mt-16 pt-12 border-t border-gray-200">
            <p className="text-center text-xs uppercase tracking-widest text-gray-500 font-semibold mb-8">Your data is safe. Your payment is secure.</p>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <div>
                  <div className="text-sm font-semibold">SSL Encrypted</div>
                  <div className="text-xs text-gray-500">TLS 1.3 / AES-256</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <div>
                  <div className="text-sm font-semibold">PayPal Verified</div>
                  <div className="text-xs text-gray-500">Buyer protection</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                <div>
                  <div className="text-sm font-semibold">GDPR Compliant</div>
                  <div className="text-xs text-gray-500">EU + US privacy</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <div>
                  <div className="text-sm font-semibold">99.9% Uptime</div>
                  <div className="text-xs text-gray-500">Enterprise SLA</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                <div>
                  <div className="text-sm font-semibold">Cancel Anytime</div>
                  <div className="text-xs text-gray-500">No contracts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">FAQ</div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
              Frequently asked <span className="gradient-text-vivid">questions</span>
            </h2>
            <p className="text-lg text-gray-600">
              Got questions? We&apos;ve got answers. Still need help? Email us anytime.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left group"
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">{faq.q}</span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all ${openFaq === i ? "rotate-180 bg-blue-50 border-blue-200" : ""}`}>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 animate-fade-in">
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 gradient-brand"></div>
        <div className="absolute inset-0 bg-grid-dark opacity-30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold tracking-wider uppercase mb-6">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            Ready when you are
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Stop losing leads
            <br/>
            <span className="text-blue-200">while you sleep</span>
          </h2>
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Install CloserAI in 5 minutes. Start capturing leads 24/7 immediately.
            Free for 14 days — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/free-trial"
              className="group inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            >
              Start Your Free Trial
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/20 transition-all w-full sm:w-auto justify-center"
            >
              Try the Live Demo
            </Link>
          </div>
          <p className="text-sm text-white/60 mt-6">Questions? Email <a href="https://mail.google.com/mail/?view=cm&to=AbdelrahmanAbdelati20@gmail.com" target="_blank" rel="noopener" className="underline hover:text-white">AbdelrahmanAbdelati20@gmail.com</a></p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-4 sm:px-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="font-bold text-white text-lg">CloserAI</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">AI that closes real estate leads 24/7 in 50+ languages. Built for real estate agents worldwide.</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  All systems operational
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition">Live Demo</Link></li>
                <li><Link href="/free-trial" className="hover:text-white transition">Free Trial</Link></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Account</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/login" className="hover:text-white transition">Client Login</Link></li>
                <li><Link href="/get-started" className="hover:text-white transition">Get Started</Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="https://mail.google.com/mail/?view=cm&to=AbdelrahmanAbdelati20@gmail.com" target="_blank" rel="noopener" className="hover:text-white transition break-all inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="text-xs">AbdelrahmanAbdelati20@gmail.com</span>
                  </a>
                </li>
                <li className="text-xs text-gray-500">Response within 24 hours</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
            <div>&copy; 2026 CloserAI. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="hover:text-white transition text-xs">Privacy</a>
              <a href="/terms" className="hover:text-white transition text-xs">Terms</a>
              <div className="text-xs">Built with <span className="text-red-500">❤</span> for agents worldwide</div>
            </div>
          </div>
        </div>
      </footer>

      {/* CONVERSION BOOSTERS: live social proof + sticky CTA */}
      <SocialProofToast />
      <StickyTrialCTA />
    </div>
  );
}
