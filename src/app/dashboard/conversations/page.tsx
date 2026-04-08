"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("/api/dashboard/conversations")
      .then((r) => r.json())
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadConversation = async (id: string) => {
    const res = await fetch(`/api/dashboard/conversations/${id}`);
    const data = await res.json();
    setSelected(data);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Conversations</h1>

      <div className="flex gap-6 h-[600px]">
        {/* Conversation List */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border overflow-y-auto flex-shrink-0">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                  selected?.id === conv.id ? "bg-brand-50" : ""
                }`}
              >
                <div className="font-medium text-sm">{conv.lead?.name || conv.visitorName}</div>
                <div className="text-xs text-gray-400">{conv._count.messages} messages</div>
                <div className="text-xs text-gray-400">{new Date(conv.createdAt).toLocaleString()}</div>
              </button>
            ))
          )}
        </div>

        {/* Chat View */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border flex flex-col">
          {selected ? (
            <>
              <div className="p-4 border-b">
                <div className="font-semibold">{selected.lead?.name || selected.visitorName}</div>
                <div className="text-sm text-gray-400">{selected.lead?.email || "No email captured"}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selected.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-brand-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
