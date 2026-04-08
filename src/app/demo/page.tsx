"use client";

import { useState, useRef, useEffect } from "react";

const DEMO_API_KEY = "cai_44d60f6ac0e849d78060792f010730ed";

export default function DemoPage() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Hi there! I'm Sarah, your AI real estate assistant at Sunshine Realty. Whether you're looking to buy, sell, or just exploring — I'm here to help! What are you looking for?" },
  ]);
  const [input, setInput] = useState("");
  const [convId, setConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}>C</div>
          <span className="font-bold text-gray-800">CloserAI <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-1">LIVE DEMO</span></span>
        </div>
        <a href="/" className="text-sm text-blue-600 hover:underline">Back to Homepage</a>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-600 text-white text-center py-3 text-sm px-4">
        This is a live demo of the CloserAI chat widget. Chat with <strong>Sarah</strong> from <strong>Sunshine Realty Group</strong> — powered by real AI. Try any language!
      </div>

      {/* Fake Website Background */}
      <div className="flex-1 relative">
        <div className="max-w-5xl mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sunshine Realty Group</h1>
            <p className="text-gray-500 mb-6">Your trusted real estate partner in Miami, FL</p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Modern Downtown Condo", price: "$485,000", beds: "2 bd / 2 ba", sqft: "1,200 sqft", desc: "Panoramic city views, rooftop pool" },
                { title: "Family Home with Pool", price: "$725,000", beds: "4 bd / 3 ba", sqft: "2,800 sqft", desc: "Heated pool, updated kitchen, 2-car garage" },
                { title: "Luxury Waterfront Villa", price: "$2,150,000", beds: "5 bd / 4 ba", sqft: "4,500 sqft", desc: "Private dock, infinity pool, smart home" },
              ].map((p) => (
                <div key={p.title} className="border rounded-xl p-4 hover:shadow-md transition">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-sm">Property Photo</div>
                  <h3 className="font-bold text-sm">{p.title}</h3>
                  <div className="text-blue-600 font-bold text-lg">{p.price}</div>
                  <div className="text-xs text-gray-500">{p.beds} | {p.sqft}</div>
                  <div className="text-xs text-gray-400 mt-1">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm">
            This is a simulated real estate website. The AI chat widget (bottom-right) is the CloserAI product.
          </div>
        </div>

        {/* THE ACTUAL CHAT WIDGET - Fixed bottom right */}
        <div className="fixed bottom-6 right-6 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col z-50">
          {/* Chat Header */}
          <div className="p-4 text-white flex items-center gap-3" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-semibold">S</div>
            <div>
              <div className="font-semibold">Sarah</div>
              <div className="text-xs text-white/70">Sunshine Realty Group - Online</div>
            </div>
            <div className="ml-auto w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={loading ? "Sarah is typing..." : "Type a message..."}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" }}
            >
              Send
            </button>
          </div>
          <div className="text-center py-1.5 text-[10px] text-gray-400">Powered by CloserAI</div>
        </div>
      </div>
    </div>
  );
}
