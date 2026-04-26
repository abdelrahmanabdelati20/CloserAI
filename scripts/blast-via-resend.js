// Cold-email blast via Resend HTTP API.
// Replaces blast-emails-ci.js (Gmail SMTP — banned 2026-04-26).
//
// Reads:
//   RESEND_API_KEY        — Resend API key (re_...)
//   SENDGRID_FROM_EMAIL   — verified sender (e.g. outreach@closerai.org)
//   SENDGRID_FROM_NAME    — display name
//
// Reuses the same emails.txt queue + blast-log.json + dnc-list.txt
// + MX validation + 4 human-written variants as the legacy script.
//
// Why Resend:
//   - Proper SPF/DKIM/DMARC on closerai.org (Gmail/Yahoo trust it)
//   - 5 req/sec rate limit (plenty for cold ramp)
//   - Per-recipient List-Unsubscribe one-click handled at provider level
//   - Personal Gmail account is safe — never touched
//
// Default daily volume: BLAST_LIMIT env or 25 (matches Vercel BLAST_PER_DAY).

const fs = require("fs");
const path = require("path");
const dns = require("dns").promises;

// Load .env.production if it exists (for local runs)
const envPath = path.join(__dirname, "..", ".env.production");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)="?(.*?)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "outreach@closerai.org";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Abdelrahman Abdelati";

if (!RESEND_API_KEY) {
  console.error("✗ RESEND_API_KEY missing. Aborting.");
  process.exit(1);
}

const EMAILS_PATH = path.join(__dirname, "emails.txt");
const LOG_PATH = path.join(__dirname, "blast-log.json");
const DNC_PATH = path.join(__dirname, "dnc-list.txt");

// ─── MX Validation (optional) ────────────────────────────────────
// Set MX_CHECK=1 to enable. Disabled by default because some sandboxes
// (including the agent runtime) block outbound DNS, which would
// false-flag every domain as "no MX". Resend's bounce reporting catches
// truly dead addresses anyway and we log them in the failed list.
const SKIP_MX = process.env.MX_CHECK !== "1";
const domainCache = {};
async function hasValidMX(email) {
  if (SKIP_MX) return true;
  const domain = email.split("@")[1];
  if (!domain) return false;
  if (domain in domainCache) return domainCache[domain];
  try {
    const records = await dns.resolveMx(domain);
    domainCache[domain] = !!(Array.isArray(records) && records.length > 0 && records[0].exchange);
  } catch {
    domainCache[domain] = false;
  }
  return domainCache[domain];
}

// ─── Company name from domain ─────────────────────────────────────
function getCompanyName(email) {
  const domain = (email.split("@")[1] || "").toLowerCase();
  if (!domain || domain === "gmail.com") return "your team";
  let core = domain.replace(/\.(com|net|org|io|co|us|ai|info|biz|tv)$/i, "");
  core = core.replace(/^(www|mail|email|info)\./i, "");
  if (core.includes(".")) core = core.split(".").pop();
  const compounds = [
    "realestate", "realty", "homes", "properties", "brokerage",
    "brokers", "broker", "team", "group", "advisors", "associates",
    "company", "house",
  ];
  for (const w of compounds) {
    const re = new RegExp(`(?<=[a-z0-9])${w}(?=[a-z0-9]|$)`, "gi");
    core = core.replace(re, ` ${w} `);
  }
  return core
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.length <= 3 && !/\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

function domainHash(email) {
  const domain = email.split("@")[1] || email;
  let h = 0;
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  return h;
}

// ─── 4 human-written variants (text first, HTML auto-derived) ────
const VARIANTS = [
  {
    subject: () => "quick question about your website",
    text: (co) => `Hi,

I was looking at the ${co} site earlier and noticed there's no live chat for visitors after hours.

I built a small AI assistant that sits on real estate sites and starts a real conversation with every visitor — answers questions, qualifies them, and texts the agent the second a hot lead comes in. Even at midnight.

A few agents using it have gone from 3-4 web leads a month to 15-20 just from the same traffic.

Would it be useful if I sent over a link where you can try it live on your own site? No forms, no calls.

— Abdelrahman Abdelati
CloserAI
https://closerai.org`,
  },
  {
    subject: () => "saw your real estate site",
    text: (co) => `Hi,

Came across the ${co} site while looking at brokerages in your market. Solid presence.

One thing I help with specifically: catching the visitors who land on your site at 9pm or on Sunday. Most brokerages lose those — nobody's online to respond fast enough, so they go to whoever does answer first.

I built an AI chat widget for real estate that handles this 24/7, in 50+ languages. It collects contact info naturally and pings the agent on hot leads.

Happy to show you the live demo if you're curious — closerai.org. Takes about 5 minutes to add to any site.

Best,
Abdelrahman Abdelati`,
  },
  {
    subject: () => "idea for your brokerage",
    text: (co) => `Hi,

Quick thought for the ${co} team: have you ever looked at how many visitors land on your site and leave without filling anything out?

For most brokerages it's over 95%. They quietly disappear and the agents never know they were there.

I built a small AI widget that starts a real conversation with every visitor, qualifies them, and texts the right agent the second someone hot comes in. It's not a chatbot script — it's a real conversation, and it works around the clock.

Worth 10 min to take a look? Just hit closerai.org — try it live, no forms.

Abdelrahman Abdelati
CloserAI`,
  },
  {
    subject: () => "how do you handle after-hours leads?",
    text: (co) => `Hi,

Most real estate sites lose 40-60% of their web leads to one specific gap: visitors that show up at 11pm or on a weekend and never hear back until Monday.

I built an AI for the ${co} team that covers exactly that — greets every visitor, figures out what they're looking for, and texts the agent on the hot ones. Agents using it report ~3x more showings booked from the same site traffic.

If it's useful, you can try it live right now on closerai.org — no signup, no forms.

— Abdelrahman Abdelati
Founder, CloserAI`,
  },
];

function emailFor(email) {
  const company = getCompanyName(email);
  const variant = VARIANTS[domainHash(email) % VARIANTS.length];
  return { subject: variant.subject(), text: variant.text(company) };
}

function htmlFor(text) {
  return (
    `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.6;color:#222;max-width:560px;">` +
    text
      .split(/\n\n+/)
      .map((p) => `<p style="margin:0 0 14px 0;">${p.replace(/\n/g, "<br>")}</p>`)
      .join("") +
    `</div>`
  );
}

// ─── Resend HTTP send ─────────────────────────────────────────────
async function sendViaResend({ to, subject, text, html }) {
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
      reply_to: FROM_EMAIL,
      headers: {
        "List-Unsubscribe": `<mailto:${FROM_EMAIL}?subject=unsubscribe>, <https://closerai.org/unsubscribe?email=${encodeURIComponent(to)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data?.message || data?.error || `HTTP ${res.status}` };
  }
  return { ok: true, id: data?.id };
}

async function main() {
  if (!fs.existsSync(EMAILS_PATH)) {
    console.log("No emails.txt — nothing to do.");
    return;
  }

  const emails = fs
    .readFileSync(EMAILS_PATH, "utf8")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));

  let log = { sent: [], failed: [] };
  if (fs.existsSync(LOG_PATH)) log = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));

  let dncSet = new Set();
  if (fs.existsSync(DNC_PATH)) {
    dncSet = new Set(
      fs
        .readFileSync(DNC_PATH, "utf8")
        .split(/\r?\n/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s && !s.startsWith("#")),
    );
  }

  const sentSet = new Set(log.sent);
  const remaining = emails.filter((e) => !sentSet.has(e) && !dncSet.has(e.toLowerCase()));
  console.log(`Loaded ${emails.length}. Already sent: ${log.sent.length}. DNC: ${dncSet.size}. To send now: ${remaining.length}`);

  if (remaining.length === 0) {
    console.log("✨ Queue drained.");
    return;
  }

  const BATCH = parseInt(process.env.BLAST_LIMIT || "25", 10);
  // Resend free tier: 5 req/s. We pace at 1.5s between sends (= ~40/min).
  // Also adds a touch of jitter so we don't look like a bot.
  const DELAY_MIN = parseInt(process.env.DELAY_MIN_MS || "1500", 10);
  const DELAY_MAX = parseInt(process.env.DELAY_MAX_MS || "2500", 10);
  const jitter = () => DELAY_MIN + Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN));

  const toSend = remaining.slice(0, BATCH);
  console.log(`Sending up to ${toSend.length} via Resend (from ${FROM_EMAIL})\n---`);

  let sent = 0;
  let skipped = 0;
  log.failed = log.failed || [];

  for (const email of toSend) {
    const mxOk = await hasValidMX(email);
    if (!mxOk) {
      console.log(`[SKIP — no MX] ${email}`);
      log.sent.push(email);
      skipped++;
      fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
      continue;
    }

    const { subject, text } = emailFor(email);
    const html = htmlFor(text);

    const result = await sendViaResend({ to: email, subject, text, html });
    if (result.ok) {
      console.log(`[${++sent}/${toSend.length - skipped}] ✓ ${email} — "${subject}" (id: ${result.id})`);
      log.sent.push(email);
    } else {
      console.error(`[FAIL] ${email}: ${result.error}`);
      log.failed.push({ email, error: result.error, at: new Date().toISOString() });
      // If we hit a credential or domain-validation error, abort — fixing
      // it run-by-run wastes the API key's reputation.
      if (/api key|invalid|domain/i.test(result.error || "")) {
        console.error("⛔ Aborting — fix the Resend config before retrying.");
        break;
      }
    }

    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
    if (sent + skipped < toSend.length) await new Promise((r) => setTimeout(r, jitter()));
  }

  console.log(`\n---\nBatch done. Sent ${sent}, skipped (no MX) ${skipped}. Total sent overall: ${log.sent.length}/${emails.length}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
