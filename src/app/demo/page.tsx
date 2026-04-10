"use client";

import { useState, useRef, useEffect } from "react";

const DEMO_API_KEY = "cai_44d60f6ac0e849d78060792f010730ed";

const PROPERTIES = [
  {
    title: "Modern Downtown Condo",
    price: "$485,000",
    beds: "2 bd / 2 ba",
    sqft: "1,200 sqft",
    desc: "Panoramic city views, rooftop pool, modern finishes",
    city: "Miami, FL",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    badge: "NEW",
  },
  {
    title: "Family Home with Pool",
    price: "$725,000",
    beds: "4 bd / 3 ba",
    sqft: "2,800 sqft",
    desc: "Heated pool, updated kitchen, 2-car garage",
    city: "Coral Gables, FL",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    badge: "HOT",
  },
  {
    title: "Luxury Waterfront Villa",
    price: "$2,150,000",
    beds: "5 bd / 4 ba",
    sqft: "4,500 sqft",
    desc: "Private dock, infinity pool, smart home features",
    city: "Miami Beach, FL",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    badge: "LUXURY",
  },
  {
    title: "Beachfront Penthouse",
    price: "$1,485,000",
    beds: "3 bd / 3 ba",
    sqft: "2,100 sqft",
    desc: "Ocean views, private terrace, concierge service",
    city: "South Beach, FL",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    badge: "NEW",
  },
  {
    title: "Charming Coconut Grove",
    price: "$895,000",
    beds: "3 bd / 2 ba",
    sqft: "2,200 sqft",
    desc: "Tropical garden, mature trees, walking distance to marina",
    city: "Coconut Grove, FL",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    badge: "POPULAR",
  },
  {
    title: "Contemporary Brickell Loft",
    price: "$625,000",
    beds: "2 bd / 2 ba",
    sqft: "1,500 sqft",
    desc: "Floor-to-ceiling windows, building amenities, valet parking",
    city: "Brickell, Miami",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    badge: "TRENDING",
  },
];

const STATS = [
  { value: "50+", label: "Languages" },
  { value: "24/7", label: "Always On" },
  { value: "<2s", label: "Response" },
  { value: "3x", label: "More Leads" },
];

const BADGES: Record<string, string> = {
  NEW: "bg-green-500",
  HOT: "bg-red-500",
  LUXURY: "bg-purple-500",
  POPULAR: "bg-orange-500",
  TRENDING: "bg-blue-500",
};

export default function DemoPage() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Hi there! I'm Sarah, your AI real estate assistant at Sunshine Realty. Whether you're looking to buy, sell, or just exploring — I'm here to help! What are you looking for?" },
  ]);
  const [input, setInput] = useState("");
  const [convId, setConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: DEMO_API_KEY, conversationId: convId, message: msg }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again!" }]);
      } else {
        setConvId(data.conversationId);
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection issue — please try again." }]);
    }
    setLoading(false);
  };

  const tryPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: prompt }]);
      setLoading(true);
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: DEMO_API_KEY, conversationId: convId, message: prompt }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
          } else {
            setConvId(data.conversationId);
            setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
          }
          setLoading(false);
        })
        .catch(() => {
          setMessages((prev) => [...prev, { role: "assistant", content: "Connection issue." }]);
          setLoading(false);
        });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top CloserAI Demo Banner */}
      <div className="text-white text-center py-3 px-4 text-sm font-medium" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}>
        This is a LIVE DEMO of the CloserAI chat widget — try it bottom-right 👉 |{" "}
        <a href="/free-trial" className="underline font-bold">Start your free 14-day trial</a>
      </div>

      {/* Fake Site Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
              S
            </div>
            <div>
              <div className="font-bold text-gray-900">Sunshine Realty Group</div>
              <div className="text-xs text-gray-500">Miami, FL · Est. 2015</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#listings" className="hover:text-orange-600">Listings</a>
            <a href="#about" className="hover:text-orange-600">About</a>
            <a href="#contact" className="hover:text-orange-600">Contact</a>
          </nav>
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600">← CloserAI Home</a>
        </div>
      </header>

      {/* Hero with Background Image */}
      <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600&q=80"
            alt="Miami luxury real estate"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
            🏡 Miami&apos;s Premier Real Estate Agency
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Find Your Dream Home <br/>in the Sunshine State
          </h1>
          <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            Luxury properties, waterfront villas, and everything in between. Ask Sarah anything about our listings.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => tryPrompt("I'm looking for a 3 bedroom house in Miami under 800k")}
              className="bg-white text-gray-900 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition text-sm"
            >
              💬 &quot;3 bedroom under 800k&quot;
            </button>
            <button
              onClick={() => tryPrompt("Show me waterfront luxury properties")}
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-5 py-2.5 rounded-lg font-medium hover:bg-white/30 transition text-sm"
            >
              💬 &quot;Waterfront luxury&quot;
            </button>
            <button
              onClick={() => tryPrompt("Hola, busco una casa en Miami")}
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-5 py-2.5 rounded-lg font-medium hover:bg-white/30 transition text-sm"
            >
              💬 &quot;Try Spanish!&quot;
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #1e3a5f, #3b82f6)" }}>
                {s.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Properties */}
      <section id="listings" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Featured Listings</h2>
            <p className="text-gray-500">Handpicked properties in Miami&apos;s most desirable neighborhoods</p>
          </div>
          <div className="hidden md:block text-sm text-gray-400">{PROPERTIES.length} properties available</div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROPERTIES.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
              onClick={() => tryPrompt(`Tell me more about the ${p.title}`)}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute top-3 left-3 ${BADGES[p.badge]} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                  {p.badge}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  {p.price}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition">{p.title}</h3>
                </div>
                <div className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {p.city}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 pb-3 border-b">
                  <span>{p.beds}</span>
                  <span>•</span>
                  <span>{p.sqft}</span>
                </div>
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">{p.desc}</p>
                <button className="mt-4 text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                  Ask Sarah about this property →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Sunshine Realty Section */}
      <section id="about" className="bg-white border-y py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <h3 className="font-bold text-lg mb-1">10,000+ Properties Sold</h3>
            <p className="text-gray-500 text-sm">Trusted by thousands of Miami homeowners since 2015</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="font-bold text-lg mb-1">Award-Winning Team</h3>
            <p className="text-gray-500 text-sm">Recognized by Miami Realtor Association 5 years in a row</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="font-bold text-lg mb-1">24/7 AI Support</h3>
            <p className="text-gray-500 text-sm">Our AI assistant Sarah is always ready to help you</p>
          </div>
        </div>
      </section>

      {/* Contact Section - Professional fake agency contact */}
      <section id="contact" className="bg-gradient-to-br from-orange-50 to-red-50 py-16 px-6 border-y border-orange-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-3">
              Contact Sunshine Realty
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Get in Touch With Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Prefer a quick chat? Click the bubble in the bottom-right corner to chat with Sarah, our 24/7 AI assistant — she speaks 50+ languages.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Office */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Visit Our Office</h3>
              <p className="text-sm text-gray-600">
                1234 Ocean Drive<br/>
                Miami Beach, FL 33139<br/>
                United States
              </p>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-sm text-gray-600">
                Mon-Sat, 9am-7pm EST<br/>
                <span className="font-semibold text-gray-900">(305) 555-0123</span><br/>
                Or chat 24/7 with AI
              </p>
            </div>

            {/* Chat */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-orange-300 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-0.5 rounded-full text-xs font-bold">
                INSTANT
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Chat With Sarah (AI)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Available 24/7 in 50+ languages. Ask about any property.
              </p>
              <button
                onClick={() => setChatOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                Open Chat →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CloserAI Branded CTA - Want this for YOUR business? */}
      <section className="py-16 px-6" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #2563eb 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center text-white mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              You just tried the real product
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Want This AI Closing <span className="text-blue-300">YOUR</span> Leads 24/7?
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Everything you just experienced — the instant replies, the 50+ language support, the property matching — runs on <strong>CloserAI</strong>. Get it on your website in under 5 minutes.
            </p>
          </div>

          {/* Inline Pricing Preview */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white hover:bg-white/15 transition">
              <div className="text-sm font-semibold text-blue-300 mb-1">STARTER</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold">$297</span>
                <span className="text-white/60">/mo</span>
              </div>
              <div className="text-xs text-green-300 font-semibold mb-3">$0 setup fee</div>
              <ul className="text-sm text-white/80 space-y-1.5">
                <li>✓ 1 Website Widget</li>
                <li>✓ 1,000 Conversations/mo</li>
                <li>✓ Lead Capture &amp; Scoring</li>
                <li>✓ 50+ Languages</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 text-gray-900 shadow-2xl scale-105 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-3 py-0.5 rounded-full text-xs font-bold">⭐ MOST POPULAR</div>
              <div className="text-sm font-semibold text-blue-600 mb-1">PROFESSIONAL</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold">$597</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <div className="text-xs text-green-600 font-semibold mb-3">$0 setup fee</div>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li>✓ 5 Website Widgets</li>
                <li>✓ 3,000 Conversations/mo</li>
                <li>✓ Advanced Lead Scoring</li>
                <li>✓ Priority Support (24h)</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white hover:bg-white/15 transition">
              <div className="text-sm font-semibold text-blue-300 mb-1">ENTERPRISE</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold">$1,297</span>
                <span className="text-white/60">/mo</span>
              </div>
              <div className="text-xs text-green-300 font-semibold mb-3">$0 setup fee</div>
              <ul className="text-sm text-white/80 space-y-1.5">
                <li>✓ Unlimited Widgets</li>
                <li>✓ 10,000 Conversations/mo</li>
                <li>✓ White-Label Option</li>
                <li>✓ Dedicated Manager</li>
              </ul>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <a
              href="/free-trial"
              className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-xl w-full sm:w-auto text-center"
            >
              Start Free 14-Day Trial →
            </a>
            <a
              href="/pricing"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition w-full sm:w-auto text-center"
            >
              See Full Pricing
            </a>
          </div>

          {/* Contact Info */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <h3 className="text-white font-bold text-lg mb-2">Questions? Talk to a human</h3>
            <p className="text-white/70 text-sm mb-4">Email us and we&apos;ll get back to you within 24 hours.</p>
            <a
              href="mailto:AbdelrahmanAbdelati20@gmail.com"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-medium transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              AbdelrahmanAbdelati20@gmail.com
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}>
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-lg font-bold">Closer<span className="text-blue-400">AI</span></span>
              </div>
              <p className="text-sm text-gray-400">AI that closes real estate leads 24/7 in 50+ languages.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Product</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li><a href="/" className="hover:text-white">Home</a></li>
                <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/demo" className="hover:text-white">Live Demo</a></li>
                <li><a href="/free-trial" className="hover:text-white">Free Trial</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Contact</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li><a href="mailto:AbdelrahmanAbdelati20@gmail.com" className="hover:text-white">AbdelrahmanAbdelati20@gmail.com</a></li>
                <li><a href="/login" className="hover:text-white">Client Login</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            <p>© 2026 CloserAI · The above &quot;Sunshine Realty Group&quot; is a simulated website to demonstrate how the widget embeds on a real estate business.</p>
          </div>
        </div>
      </footer>

      {/* THE ACTUAL CHAT WIDGET - Fixed bottom right */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition z-50"
          style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            1
          </span>
        </button>
      )}

      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-[calc(100vw-2rem)] sm:w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col z-50">
          {/* Chat Header */}
          <div className="p-4 text-white flex items-center gap-3" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}>
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-semibold">S</div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2">
                Sarah
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">AI</span>
              </div>
              <div className="text-xs text-white/70">Sunshine Realty · Online now</div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/70 hover:text-white p-1"
              aria-label="Minimize"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px] max-h-[400px] bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1" style={{ background: "linear-gradient(135deg, #1e3a5f, #3b82f6)" }}>
                    S
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm shadow-sm border"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1" style={{ background: "linear-gradient(135deg, #1e3a5f, #3b82f6)" }}>
                  S
                </div>
                <div className="bg-white border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && !loading && (
            <div className="px-4 py-2 border-t border-b bg-white flex flex-wrap gap-2">
              <button
                onClick={() => tryPrompt("Show me luxury properties")}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition"
              >
                🏖️ Luxury
              </button>
              <button
                onClick={() => tryPrompt("Family home under 800k")}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition"
              >
                🏡 Family home
              </button>
              <button
                onClick={() => tryPrompt("Hola, busco una casa")}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition"
              >
                🌍 Español
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={loading ? "Sarah is typing..." : "Ask about any property..."}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="text-center py-1.5 text-[10px] text-gray-400 bg-white border-t">
            Powered by <a href="/" className="font-semibold text-blue-600 hover:underline">CloserAI</a> · Try on your site free
          </div>
        </div>
      )}
    </div>
  );
}
