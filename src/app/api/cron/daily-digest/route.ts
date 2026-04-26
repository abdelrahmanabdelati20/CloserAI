import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * DAILY DIGEST — fires every morning at 12:00 UTC (~8 AM ET / 5 AM PT) and
 * emails the founder a one-screen summary of what happened in the last 24h.
 *
 * Sections:
 *   - Cold outreach: sent / replied / bounced
 *   - Trial signups (new accounts in last 24h)
 *   - Paid conversions (new active subscriptions in last 24h)
 *   - Pipeline health: queue depth + tomorrow's projected sends
 *
 * Goal: founder doesn't have to log into the dashboard to know if anything
 * happened. They scan the email at breakfast — if there's a "REPLIED" line,
 * they go reply. Otherwise they keep scrolling.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const cronHeader = req.headers.get("x-vercel-cron") || req.headers.get("x-cron-secret") || "";
  const cronSecret = process.env.CRON_SECRET || "";
  const isAuthorized =
    cronHeader === "1" ||
    cronHeader === cronSecret ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Cold outreach metrics (last 24h)
  const [sentLast24h, repliedLast24h, bouncedLast24h, followedUpLast24h, pendingNow] = await Promise.all([
    prisma.prospectQueue.count({ where: { status: "sent", sentAt: { gte: dayAgo } } }),
    prisma.prospectQueue.count({ where: { repliedAt: { gte: dayAgo, not: null } } }),
    prisma.prospectQueue.count({ where: { status: "bounced" } }), // running total
    prisma.prospectQueue.count({ where: { status: "followed_up", followUpSentAt: { gte: dayAgo } } }),
    prisma.prospectQueue.count({ where: { status: "pending" } }),
  ]);

  // Pipeline metrics
  const [trialSignupsLast24h, paidNew24h, paidTotal, totalClients] = await Promise.all([
    prisma.client.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.client.count({ where: { paypalStatus: "active", updatedAt: { gte: dayAgo } } }),
    prisma.client.count({ where: { paypalStatus: "active" } }),
    prisma.client.count({}),
  ]);

  // Recent replies (so the founder can act on them)
  const repliesPreview = await prisma.prospectQueue.findMany({
    where: { repliedAt: { gte: dayAgo, not: null } },
    select: { email: true, businessName: true, city: true, firstSubject: true, repliedAt: true },
    orderBy: { repliedAt: "desc" },
    take: 10,
  });

  const blastPerDay = Number(process.env.BLAST_PER_DAY || 15);

  const subject =
    repliedLast24h > 0
      ? `🔔 ${repliedLast24h} repl${repliedLast24h === 1 ? "y" : "ies"} overnight + ${paidNew24h} paid conversion${paidNew24h === 1 ? "" : "s"} — daily digest`
      : `Daily digest: ${sentLast24h} sent, ${trialSignupsLast24h} trials, ${paidNew24h} paid`;

  const repliesHtml =
    repliesPreview.length > 0
      ? `<h3 style="color:#dc2626;margin-top:24px;">🔥 ${repliedLast24h} reply / replies — reply within 1 hour for 391% conversion lift</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px;">
  ${repliesPreview
    .map(
      (r) =>
        `<tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 4px;"><strong>${r.businessName}</strong> · ${r.city || ""}<br/><a href="https://mail.google.com/mail/?view=cm&to=${r.email}" style="color:#2563eb;">${r.email}</a></td><td style="padding:8px 4px;font-size:11px;color:#6b7280;text-align:right;">${r.firstSubject?.slice(0, 50) || ""}</td></tr>`,
    )
    .join("")}
</table>`
      : `<p style="color:#6b7280;font-style:italic;">No replies in the last 24h yet. Domain reputation is still warming up — first replies typically arrive between days 4-10 from a brand-new domain.</p>`;

  const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1f2937;">
  <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);color:white;padding:24px;border-radius:12px 12px 0 0;">
    <h1 style="margin:0;font-size:22px;">CloserAI · Daily Digest</h1>
    <div style="opacity:.8;font-size:13px;margin-top:4px;">${now.toUTCString()}</div>
  </div>
  <div style="background:white;padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;">

    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin:0 0 8px;">Cold outreach (last 24h)</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;">Sent (first-touch)</td><td style="text-align:right;font-weight:600;">${sentLast24h}</td></tr>
      <tr><td style="padding:6px 0;">Follow-ups sent</td><td style="text-align:right;font-weight:600;">${followedUpLast24h}</td></tr>
      <tr><td style="padding:6px 0;color:${repliedLast24h > 0 ? "#dc2626" : "#1f2937"};">Replies received <strong>${repliedLast24h > 0 ? "🔥" : ""}</strong></td><td style="text-align:right;font-weight:600;color:${repliedLast24h > 0 ? "#dc2626" : "#1f2937"};">${repliedLast24h}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Bounces (running total)</td><td style="text-align:right;font-weight:600;color:#6b7280;">${bouncedLast24h}</td></tr>
    </table>

    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin:24px 0 8px;">Funnel (last 24h)</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;">New trial signups</td><td style="text-align:right;font-weight:600;">${trialSignupsLast24h}</td></tr>
      <tr><td style="padding:6px 0;color:${paidNew24h > 0 ? "#16a34a" : "#1f2937"};">New paid conversions <strong>${paidNew24h > 0 ? "💰" : ""}</strong></td><td style="text-align:right;font-weight:600;color:${paidNew24h > 0 ? "#16a34a" : "#1f2937"};">${paidNew24h}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Total active subscriptions</td><td style="text-align:right;font-weight:600;color:#6b7280;">${paidTotal}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Total trial accounts</td><td style="text-align:right;font-weight:600;color:#6b7280;">${totalClients}</td></tr>
    </table>

    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin:24px 0 8px;">Pipeline health</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;">Prospects pending in queue</td><td style="text-align:right;font-weight:600;">${pendingNow}</td></tr>
      <tr><td style="padding:6px 0;">Tomorrow's projected sends</td><td style="text-align:right;font-weight:600;">${Math.min(blastPerDay, pendingNow)}</td></tr>
    </table>

    ${repliesHtml}

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
    <p style="font-size:12px;color:#6b7280;">
      Auto-runs every morning at 12:00 UTC. View full data at <a href="https://closerai.org/admin">closerai.org/admin</a>.<br/>
      System sends ${blastPerDay} personalized cold emails/day + auto-discovers 2-4 new prospects/day. Domain reputation builds week by week.
    </p>
  </div>
</body></html>`;

  const text = `CloserAI · Daily Digest · ${now.toUTCString()}

COLD OUTREACH (last 24h):
  Sent: ${sentLast24h}
  Follow-ups: ${followedUpLast24h}
  Replies: ${repliedLast24h} ${repliedLast24h > 0 ? "🔥 REPLY ASAP" : ""}
  Bounces (total): ${bouncedLast24h}

FUNNEL (last 24h):
  Trial signups: ${trialSignupsLast24h}
  Paid conversions: ${paidNew24h} ${paidNew24h > 0 ? "💰" : ""}
  Total active subs: ${paidTotal}
  Total trial accounts: ${totalClients}

PIPELINE:
  Pending in queue: ${pendingNow}
  Tomorrow projected: ${Math.min(blastPerDay, pendingNow)}

${repliesPreview.length > 0 ? `\nREPLIES TO ACT ON:\n${repliesPreview.map((r) => `  • ${r.businessName} <${r.email}> — ${r.firstSubject?.slice(0, 60) || ""}`).join("\n")}` : "\nNo replies yet — domain reputation still warming. First replies typically days 4-10."}

Full dashboard: https://closerai.org/admin`;

  const adminEmail = (process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL || "AbdelrahmanAbdelati20@gmail.com")
    .replace(/[\r\n]+/g, "")
    .replace(/\\n/g, "")
    .trim();

  const result = await sendEmail({
    clientId: null,
    to: adminEmail,
    subject,
    body: text,
    html,
    marketing: false,
  });

  return NextResponse.json({
    ok: true,
    sentAt: now.toISOString(),
    digestSent: result.ok,
    error: result.ok ? undefined : result.error,
    metrics: {
      sentLast24h,
      followedUpLast24h,
      repliedLast24h,
      trialSignupsLast24h,
      paidNew24h,
      paidTotal,
      pendingNow,
    },
  });
}

export async function POST(req: Request) {
  return GET(req);
}
