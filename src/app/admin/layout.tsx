"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Overview",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: "/admin/notifications",
    label: "Notifications",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
  {
    href: "/admin/clients",
    label: "Clients",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    href: "/admin/leads",
    label: "All Leads",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevCountRef = useRef(0);

  // Play subtle "ding" using Web Audio API (no file needed)
  const playDing = () => {
    try {
      if (!soundEnabled) return;
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.36);
    } catch {}
  };

  // Show toast notification
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    // Load sound preference from localStorage
    try {
      const saved = localStorage.getItem("admin_sound_enabled");
      if (saved !== null) setSoundEnabled(saved === "true");
    } catch {}
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const data = await res.json();
          const newCount = data.unreadCount || 0;

          // Trigger browser notification + toast + sound when new notifications arrive
          if (newCount > prevCountRef.current && prevCountRef.current > 0) {
            const diff = newCount - prevCountRef.current;
            const msg = diff === 1 ? "New notification!" : `${diff} new notifications!`;
            showToast(msg);
            playDing();

            // Browser push notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("CloserAI", {
                body: msg,
                icon: "https://closerai-app.vercel.app/logo-pfp-250.png",
                badge: "https://closerai-app.vercel.app/logo-pfp-250.png",
                tag: "closerai-notification",
              });
            }
          }
          prevCountRef.current = newCount;
          setUnreadCount(newCount);
        }
      } catch {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, soundEnabled]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem("admin_sound_enabled", String(next));
    } catch {}
    // Play test sound when turning on
    if (next) {
      setTimeout(() => {
        try {
          const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
          if (!AudioCtx) return;
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.36);
        } catch {}
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar (dark premium) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-gradient-to-b from-gray-950 via-slate-950 to-blue-950 text-white flex flex-col z-50 transition-transform lg:translate-x-0 border-r border-gray-900 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-900/50">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">
                Closer<span className="gradient-text-vivid">AI</span>
              </span>
              <span className="text-[9px] font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-1.5 py-0.5 rounded">
                ADMIN
              </span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
            Admin Panel
          </div>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const showBadge = item.href === "/admin/notifications" && unreadCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium relative ${
                  active
                    ? "bg-white/10 text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 gradient-brand rounded-r-full"></span>
                )}
                <svg
                  className={`w-5 h-5 flex-shrink-0 ${active ? "text-blue-300" : "text-white/50 group-hover:text-white/80"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse shadow-lg shadow-red-500/50">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sound toggle + Status card */}
        <div className="p-3 space-y-2">
          <button
            onClick={toggleSound}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition text-xs font-medium"
            title={soundEnabled ? "Mute notification sounds" : "Enable notification sounds"}
          >
            {soundEnabled ? (
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
            <span className="flex-1 text-left">Notification sound</span>
            <span className={`text-[10px] font-bold ${soundEnabled ? "text-green-400" : "text-white/40"}`}>
              {soundEnabled ? "ON" : "OFF"}
            </span>
          </button>
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <div className="text-xs font-bold text-green-400">All systems operational</div>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                API, widgets, and billing services are running smoothly.
              </p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="p-3 border-t border-gray-900/50">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition text-sm font-medium"
          >
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-base font-bold tracking-tight">
              Closer<span className="gradient-text">AI</span>
              <span className="ml-1.5 text-[9px] font-bold bg-yellow-400 text-gray-900 px-1.5 py-0.5 rounded">
                ADMIN
              </span>
            </span>
          </Link>
          <div className="w-10"></div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Toast notification popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-fade-up">
          <div className="bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 max-w-sm">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">{toast}</div>
              <div className="text-xs text-gray-400">Just now</div>
            </div>
            <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white transition flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
