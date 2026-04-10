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

      {/* Footer Callout */}
      <section id="contact" className="py-12 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to find your dream home?</h3>
          <p className="text-gray-500 mb-4">Click the chat bubble and ask Sarah anything — in any language!</p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-400 bg-white border rounded-full px-4 py-2">
            👉 <span className="font-medium">The chat widget is in the bottom-right corner</span>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-6">
          <p>© 2026 Sunshine Realty Group (Demo)</p>
          <p className="mt-2">
            This is a simulated real estate website. The AI chat widget is the real CloserAI product.{" "}
            <a href="/free-trial" className="text-orange-600 font-medium hover:underline">Get your own free trial →</a>
          </p>
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
