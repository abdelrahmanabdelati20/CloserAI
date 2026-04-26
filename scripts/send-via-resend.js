// Send personalized cold emails to verified prospects via RESEND.
// Uses the RESEND_API_KEY from .env.production (pulled via vercel env pull).
// Sends from SENDGRID_FROM_EMAIL (closerai.org domain) — completely
// isolated from the user's Gmail account.
//
// CAN-SPAM compliance: every email includes a "reply unsubscribe" line
// and the sender's name. The closerai.org domain handles unsubscribe
// processing if/when needed.
//
// Usage:
//   node scripts/send-via-resend.js [batch_limit] [delay_ms]
//   batch_limit: max emails this run (default 25 — safe daily volume on a
//                fresh sender domain)
//   delay_ms:    spacing between sends (default 4000ms — Resend handles 5/s
//                but we go slower to avoid burst patterns)
//
// Env (required, loaded from .env.production):
//   RESEND_API_KEY
//   SENDGRID_FROM_EMAIL  (e.g. founder@closerai.org)
//   SENDGRID_FROM_NAME   (e.g. "Abdelrahman @ CloserAI")
//   ADMIN_EMAIL          (for replyTo, so replies go to user's inbox)

const fs = require("fs");
const path = require("path");

// Load env vars from .env.production if present, OR allow direct env injection.
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.production");
  if (!fs.existsSync(envPath)) return;
  const txt = fs.readFileSync(envPath, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}
loadEnv();

const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim();
const FROM_EMAIL = (process.env.SENDGRID_FROM_EMAIL || "").trim();
const FROM_NAME = (process.env.SENDGRID_FROM_NAME || "CloserAI").trim();
const REPLY_TO = (process.env.ADMIN_EMAIL || process.env.GMAIL_USER || "").trim();

if (!RESEND_API_KEY) {
  console.error("✗ RESEND_API_KEY missing. Run `vercel env pull` first.");
  process.exit(1);
}
if (!FROM_EMAIL || /@gmail\.com$/i.test(FROM_EMAIL)) {
  console.error(`✗ SENDGRID_FROM_EMAIL is unsafe: ${FROM_EMAIL}. Must NOT be Gmail.`);
  process.exit(1);
}

const PROSPECTS_PATH = path.join(__dirname, "prospects.json");
const LOG_PATH = path.join(__dirname, "blast-log.json");
const SUPPRESSION_PATH = path.join(__dirname, "suppression-list.txt");
const DNC_PATH = path.join(__dirname, "dnc-list.txt");

// Suppression list — addresses that bounced/were-suppressed/complained.
// NEVER send to these again. Loaded once at startup.
const suppressed = new Set();
function loadSuppression() {
  for (const file of [SUPPRESSION_PATH, DNC_PATH]) {
    if (!fs.existsSync(file)) continue;
    const txt = fs.readFileSync(file, "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const e = line.trim().toLowerCase();
      if (e && e.includes("@")) suppressed.add(e);
    }
  }
}
loadSuppression();
console.log(`Suppression list loaded: ${suppressed.size} blocked addresses`);

function firstNameFromEmail(email) {
  const local = (email || "").split("@")[0];
  const generic = /^(info|contact|hello|admin|support|sales|inquiries|inquiry|team|office|comments|broker|compliance|valleybroker|webmaster|reception|leads)$/i;
  if (generic.test(local)) return null;
  const m = local.match(/^[A-Za-z]+/);
  if (!m || m[0].length < 3) return null;
  return m[0].charAt(0).toUpperCase() + m[0].slice(1).toLowerCase();
}

function buildEmail(p) {
  const { email, company, city, website } = p;
  const firstName = firstNameFromEmail(email);
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
  const cityShort = (city || "").split(",")[0].trim();

  const variants = [
    {
      subject: `quick question about your ${cityShort} site`,
      body: `${greeting}

I was on ${website} earlier — really like how ${company} is positioned in ${cityShort}. One thing I noticed though: there's no live chat catching visitors who land after hours.

I built a small AI assistant specifically for real estate sites. Greets every visitor in ~30 seconds, asks what they're looking for, collects contact info, and texts the agent the second a hot lead comes in. Even at 11pm or on a Sunday.

Agents using it have gone from 3-4 web leads a month to 15-20+ from the same traffic.

You can try it live yourself — no signup, no calls: https://closerai.org/demo

14-day free trial, no credit card. Starter is $299/month.

— Abdelrahman Abdelati
Founder, CloserAI
https://closerai.org

Reply "unsubscribe" and I'll remove you immediately.`,
    },
    {
      subject: `${company} — saw your site`,
      body: `${greeting}

Came across ${website} while looking at ${cityShort} brokerages. The site is solid.

One small gap I help with: nothing on the site is talking to visitors who show up at 9pm or on Sunday. That's where most real estate web traffic shows up — and it's the gap where leads go to whoever responds first.

CloserAI is a small AI chat widget built specifically for real estate. It qualifies every visitor in 30 seconds, works in 50+ languages, and texts the agent on the hot ones. About 5 minutes to install.

Live demo: https://closerai.org/demo
Free 14-day trial, no credit card.

Best,
Abdelrahman Abdelati
CloserAI

Reply "unsubscribe" and I'll remove you.`,
    },
    {
      subject: `idea for ${company}`,
      body: `${greeting}

Quick thought — out of every 100 visitors landing on ${website}, how many fill out a form or call? For most ${cityShort} brokerages it's under 5. The other 95+ leave quietly.

I built something that closes that gap: a small AI widget that starts a real conversation with every visitor, naturally collects contact info, and texts the agent the moment someone hot comes in.

Some agents using it have tripled their booked showings from the same traffic.

If you want to take a look — 14 days free, no card: https://closerai.org

— Abdelrahman Abdelati
CloserAI

Reply "unsubscribe" and I'll remove you.`,
    },
    {
      subject: `${cityShort} — how do you handle after-hours leads?`,
      body: `${greeting}

I work with real estate teams on one specific problem: the leads that hit ${website} at 11pm or on a Sunday and never hear back fast enough.

Most brokerages lose 40-60% of their web leads this way. Not because the agents aren't great — just because nobody can be online 24/7.

I built an AI that covers that exact gap. It greets every visitor on your site, figures out what they're looking for, and texts ${firstName ? "you" : "the agent"} on the hot ones. Real estate teams using it report ~3x more showings booked from the same traffic.

Live demo (no signup): https://closerai.org/demo
14 days free.

— Abdelrahman Abdelati
Founder, CloserAI

Reply "unsubscribe" and I'll remove you.`,
    },
  ];

  // Hash to consistently assign variant per prospect (so re-runs don't change emails)
  let h = 0;
  const k = email + (firstName || "");
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return variants[h % variants.length];
}

function htmlFor(text) {
  return `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.6;color:#222;max-width:560px;">` +
    text
      .split(/\n\n+/)
      .map((p) => `<p style="margin:0 0 14px 0;">${p.replace(/\n/g, "<br>")}</p>`)
      .join("") +
    `</div>`;
}

async function sendViaResend(to, subject, text, html, replyTo) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      text,
      html,
      reply_to: replyTo || undefined,
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, id: data.id, error: data.message || null };
}

async function main() {
  const BATCH = parseInt(process.argv[2] || "25", 10);
  const DELAY = parseInt(process.argv[3] || "4000", 10);

  const prospects = JSON.parse(fs.readFileSync(PROSPECTS_PATH, "utf8"));
  let log = { sent: [], failed: [] };
  if (fs.existsSync(LOG_PATH)) log = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
  const sentSet = new Set(log.sent || []);
  const failedSet = new Set(log.failed || []);

  // Filter: only prospects we haven't yet contacted via Resend AND that
  // aren't on the bounce/complaint suppression list. Sending to a known-bad
  // address damages our sender reputation immediately, so this filter is
  // non-negotiable.
  const remaining = prospects.filter((p) => {
    const e = (p.email || "").toLowerCase();
    if (sentSet.has(p.email) || failedSet.has(p.email)) return false;
    if (suppressed.has(e)) return false;
    return true;
  });
  const blockedBySuppression = prospects.filter((p) => suppressed.has((p.email || "").toLowerCase())).length;
  if (blockedBySuppression > 0) {
    console.log(`Blocked by suppression list: ${blockedBySuppression}`);
  }
  console.log(`Loaded ${prospects.length} prospects; ${remaining.length} not yet contacted.`);

  if (remaining.length === 0) {
    console.log("✨ All prospects already contacted. Add more to prospects.json.");
    return;
  }

  const toSend = remaining.slice(0, BATCH);
  console.log(`Sending ${toSend.length} via Resend (from: ${FROM_EMAIL}, replyTo: ${REPLY_TO || "(none)"}, delay: ${DELAY}ms)\n---`);

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < toSend.length; i++) {
    const p = toSend[i];
    const { subject, body } = buildEmail(p);
    try {
      const r = await sendViaResend(p.email, subject, body, htmlFor(body), REPLY_TO);
      if (r.ok) {
        sent += 1;
        sentSet.add(p.email);
        log.sent = Array.from(sentSet);
        fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
        console.log(`[${sent}] ✓ ${p.email}  (${p.company} — ${p.city})  id=${r.id}`);
      } else {
        failed += 1;
        failedSet.add(p.email);
        log.failed = Array.from(failedSet);
        fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
        console.error(`[fail] ${p.email}: ${r.status} ${r.error}`);
      }
    } catch (err) {
      failed += 1;
      console.error(`[exception] ${p.email}: ${err.message}`);
    }
    if (i < toSend.length - 1) await new Promise((r) => setTimeout(r, DELAY));
  }

  console.log(`\n---\nDone. Sent ${sent}, failed ${failed}.`);
  console.log(`Total contacted ever: ${sentSet.size}.`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
