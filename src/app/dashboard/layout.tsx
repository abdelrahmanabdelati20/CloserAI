"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", section: "Workspace", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/dashboard/leads", label: "Leads", section: "CRM", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/dashboard/deals", label: "Deals", section: "CRM", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/dashboard/tasks", label: "Tasks", section: "CRM", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { href: "/dashboard/transactions", label: "Transactions", section: "CRM", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { href: "/dashboard/conversations", label: "Conversations", section: "Engage", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { href: "/dashboard/campaigns", label: "Campaigns", section: "Engage", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { href: "/dashboard/smartplans", label: "Smart Plans", section: "Engage", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { href: "/dashboard/calls", label: "Power Dialer", section: "Engage", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
  { href: "/dashboard/social", label: "Social Media", section: "Grow", icon: "M7 4V2m0 2v2M7 4H5.5A2.5 2.5 0 003 6.5v12A2.5 2.5 0 005.5 21h13a2.5 2.5 0 002.5-2.5v-12A2.5 2.5 0 0018.5 4H17m-10 0h10m0 0V2m0 2v2" },
  { href: "/dashboard/landing", label: "Landing Pages", section: "Grow", icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" },
  { href: "/dashboard/valuations", label: "Home Valuations", section: "Grow", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { href: "/dashboard/properties", label: "Properties", section: "Catalog", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { href: "/dashboard/widgets", label: "Widgets", section: "Catalog", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  { href: "/dashboard/team", label: "Team", section: "Manage", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/dashboard/integrations", label: "Integrations", section: "Manage", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { href: "/dashboard/settings", label: "Settings", section: "Manage", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const prevLeadsRef = useRef<number | null>(null);

  // Play subtle "ding" using Web Audio API
  const playDing = () => {
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
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.36);
    } catch {}
  };

  useEffect(() => {
    let cancelled = false;
    const fetchLeads = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok && !cancelled) {
          const data = await res.json();
          const count = data.leadsCount || 0;
          if (prevLeadsRef.current !== null && count > prevLeadsRef.current) {
            const diff = count - prevLeadsRef.current;
            const msg = diff === 1 ? "New lead captured!" : `${diff} new leads captured!`;
            setToast(msg);
            setTimeout(() => setToast(null), 5000);
            playDing();
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("CloserAI", {
                body: msg,
                icon: "/logo-pfp-250.png",
                tag: "closerai-lead",
              });
            }
            setNewLeadsCount((prev) => prev + diff);
          }
          prevLeadsRef.current = count;
        }
      } catch {}
    };
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Reset counter when viewing leads page
    if (pathname === "/dashboard/leads") setNewLeadsCount(0);
  }, [pathname]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Closer<span className="gradient-text">AI</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {(() => {
            const sections: string[] = [];
            NAV_ITEMS.forEach((item) => {
              if (!sections.includes(item.section)) sections.push(item.section);
            });
            return sections.map((sec, secIdx) => (
              <div key={sec} className={secIdx > 0 ? "pt-3" : ""}>
                <div className="px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {sec}
                </div>
                {NAV_ITEMS.filter((i) => i.section === sec).map((item) => {
                  const active = pathname === item.href;
                  const showBadge = item.href === "/dashboard/leads" && newLeadsCount > 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium relative ${
                        active
                          ? "gradient-brand text-white shadow-md shadow-blue-500/30"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span className="flex-1">{item.label}</span>
                      {showBadge && (
                        <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse shadow-lg shadow-red-500/50">
                          {newLeadsCount > 99 ? "99+" : newLeadsCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ));
          })()}
        </nav>

        {/* Upgrade card */}
        <div className="p-3">
          <div className="relative overflow-hidden gradient-brand rounded-2xl p-4 text-white shadow-lg shadow-blue-500/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="text-xs font-bold">Need help?</div>
              </div>
              <p className="text-xs text-white/80 leading-relaxed mb-3">
                Our team responds within 24 hours to any question.
              </p>
              <a
                href="https://mail.google.com/mail/?view=cm&to=AbdelrahmanAbdelati20@gmail.com" target="_blank" rel="noopener"
                className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition"
              >
                Contact support
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(session?.user?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{session?.user?.name || "User"}</div>
              <div className="text-xs text-gray-500 truncate">{session?.user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition text-sm font-medium"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content area */}
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
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-base font-bold tracking-tight">
              Closer<span className="gradient-text">AI</span>
            </span>
          </Link>
          <div className="w-10"></div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Toast notification popup for new leads */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-fade-up">
          <div className="bg-white text-gray-900 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-200 max-w-sm">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">{toast}</div>
              <div className="text-xs text-gray-500">Tap Leads to view</div>
            </div>
            <Link
              href="/dashboard/leads"
              onClick={() => setToast(null)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition flex-shrink-0 whitespace-nowrap"
            >
              View →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
