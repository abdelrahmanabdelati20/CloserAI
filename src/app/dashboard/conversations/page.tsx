"use client";

import { useEffect, useRef, useState } from "react";

interface ConversationData {
  id: string;
  visitorName: string;
  status: string;
  createdAt: string;
  lead: { name: string; email: string } | null;
  messages: Array<{ id: string; role: string; content: string; createdAt: string }>;
  _count: { messages: number };
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selected, setSelected] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/dashboard/conversations")
      .then((r) => r.json())
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [selected]);

  const loadConversation = async (id: string) => {
    const res = await fetch(`/api/dashboard/conversations/${id}`);
    const data = await res.json();
    setSelected(data);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
        <div className="text-sm text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-1">
          Conversations
        </h1>
        <p className="text-gray-500">{conversations.length} total conversations captured by your AI</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Conversation List */}
        <div className="w-full lg:w-80 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col flex-shrink-0">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">All chats</h2>
            <span className="text-xs text-gray-400">{conversations.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const active = selected?.id === conv.id;
                const initial = (conv.lead?.name || conv.visitorName || "?").charAt(0).toUpperCase();
                return (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-100 transition-all flex items-start gap-3 ${
                      active ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{conv.lead?.name || conv.visitorName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {conv._count.messages} messages
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(conv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full gradient-brand flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md shadow-blue-500/20">
                  {(selected.lead?.name || selected.visitorName || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{selected.lead?.name || selected.visitorName}</div>
                  <div className="text-sm text-gray-500 truncate">{selected.lead?.email || "No email captured"}</div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {selected.messages.length} msgs
                </div>
              </div>
              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                {selected.messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role !== "user" && (
                      <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-auto">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "gradient-brand text-white rounded-br-sm shadow-md shadow-blue-500/20"
                          : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 mb-4 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Select a conversation</h3>
              <p className="text-sm text-gray-500">Click any conversation on the left to view the full chat history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
