// CI-friendly version of blast-emails.js for GitHub Actions.
// Reads GMAIL_USER + GMAIL_APP_PASSWORD from env vars (NOT hardcoded).
// Everything else mirrors blast-emails.js so logs stay compatible.

// ╔══════════════════════════════════════════════════════════════════╗
// ║  PERMANENT RULE — NEVER REMOVE OR BYPASS:                       ║
// ║  Before sending ANY email, the domain MUST have a valid MX      ║
// ║  record. No MX = not a real email recipient = SKIP, always.     ║
// ║  This check cannot be disabled by env vars or config.           ║
// ╚══════════════════════════════════════════════════════════════════╝

const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const dns = require("dns").promises;

const GMAIL_USER = process.env.GMAIL_USER || "AbdelrahmanAbdelati20@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";

if (!GMAIL_APP_PASSWORD) {
  console.error("✗ GMAIL_APP_PASSWORD env var missing. Aborting.");
  process.exit(1);
}

const EMAILS_PATH = path.join(__dirname, "emails.txt");
const LOG_PATH = path.join(__dirname, "blast-log.json");

// ─── MX Validation ────────────────────────────────────────────────
// PERMANENT RULE: Every domain must resolve a real MX record before
// we attempt delivery. Dead domains waste SMTP reputation & quota.
const domainCache = {};

async function hasValidMX(email) {
  const domain = email.split("@")[1];
  if (!domain) return false;
  if (domain in domainCache) return domainCache[domain];
  try {
    const records = await dns.resolveMx(domain);
    const valid = Array.isArray(records) && records.length > 0 && records[0].exchange;
    domainCache[domain] = !!valid;
  } catch {
    domainCache[domain] = false;
  }
  return domainCache[domain];
}

// ─── Company name from domain ─────────────────────────────────────
function getCompanyName(email) {
  const domain = email.split("@")[1];
  if (!domain || domain === "gmail.com") return "your team";
  const core = domain
    .replace(/\.(com|net|org|io|co|us|ai)$/i, "")
    .replace(/(realty|realestate|homes|group|brokerage|brokers|properties|re)$/i, " $1");
  return core
    .split(/[-.]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

// ─── Hash helper for consistent variant selection per domain ──────
function domainHash(email) {
  const domain = email.split("@")[1] || email;
  let h = 0;
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  return h;
}

// ─── 4 human-written email variants ──────────────────────────────
// Short, plain prose. No trigger words (free trial, FREE, offer, etc.).
// Written to feel like a real person dashed off a quick note.
const VARIANTS = [
  {
    subject: (co) => `Quick question about ${co}'s website`,
    text: (co) => `Hi,

I was looking at ${co}'s website earlier and noticed there's no chat widget — no one there to talk to visitors after hours.

I built a small AI assistant that sits on real estate sites and starts conversations with visitors the moment they land. It collects contact info and books showings, even at midnight.

Agents using it are booking 2-3x more showings from the same traffic, simply because they're the first to respond.

Would it make sense to hop on a quick call, or would you prefer I just send over a link so you can see it yourself?

— Abdelrahman
Founder, CloserAI
https://closerai-app.vercel.app`,
  },
  {
    subject: (co) => `${co} — saw something on your site`,
    text: (co) => `Hi there,

I came across ${co} while researching brokerages in your area. Really solid presence.

One thing I noticed: there's nothing on the site to catch visitors who show up outside business hours. That's usually where most of the traffic goes — evenings, weekends, Sundays.

I built an AI chat tool specifically for real estate — it talks to every visitor, asks what they're looking for, and sends you a text the second a hot lead comes in. Works in 50+ languages too, which has been a big deal for international buyers.

Happy to show you how it works with a quick live demo — no pressure at all.

Best,
Abdelrahman Abdelati
https://closerai-app.vercel.app`,
  },
  {
    subject: (co) => `An idea for ${co}`,
    text: (co) => `Hi,

Quick thought — have you ever looked at how many people visit ${co}'s website but never fill out a form or call?

For most brokerages it's over 95% of visitors. They leave quietly, and the agent never knows they were there.

I built something that changes that: a small AI widget that starts a real conversation with every visitor, collects their contact info naturally, and texts the agent right away when someone hot comes in.

It takes about 5 minutes to add to any site. A few agents I know went from 3-4 website leads a month to 15-20+ just from the same traffic.

Worth 10 minutes to take a look? I can send a demo link or schedule a quick walkthrough — whichever is easier.

Abdelrahman
CloserAI — https://closerai-app.vercel.app`,
  },
  {
    subject: (co) => `${co} — how do you handle after-hours leads?`,
    text: (co) => `Hi,

I work with real estate teams on one specific problem: the leads that come to your website at 11pm or on Sunday and never hear back.

Most brokerages lose 40-60% of their web leads this way — not because the agents aren't good, but because nobody's online to respond fast enough.

I built an AI that covers that gap for ${co}. It greets every visitor, figures out what they're looking for, and sends you a text with the hot ones. Agents who've added it report roughly 3x more showings booked per month.

If you're curious what it looks like, I'm happy to send a link where you can try it live. No forms, no calls required — just a quick look.

— Abdelrahman Abdelati
Founder, CloserAI
https://closerai-app.vercel.app`,
  },
];

function emailFor(email) {
  const company = getCompanyName(email);
  const variant = VARIANTS[domainHash(email) % VARIANTS.length];
  return {
    subject: variant.subject(company),
    text: variant.text(company),
  };
}

function htmlFor(text) {
  return `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.6;color:#222;max-width:560px;">` +
    text
      .split(/\n\n+/)
      .map((p) => `<p style="margin:0 0 14px 0;">${p.replace(/\n/g, "<br>")}</p>`)
      .join("") +
    `</div>`;
}

async function main() {
  if (!fs.existsSync(EMAILS_PATH)) {
    console.log("No emails.txt file — nothing to do.");
    return;
  }

  const emails = fs
    .readFileSync(EMAILS_PATH, "utf8")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));

  console.log(`Loaded ${emails.length} emails from file`);

  let log = { sent: [], failed: [] };
  if (fs.existsSync(LOG_PATH)) log = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));

  const sentSet = new Set(log.sent);
  const remaining = emails.filter((e) => !sentSet.has(e));
  console.log(`Already sent: ${log.sent.length}. To send now: ${remaining.length}`);

  if (remaining.length === 0) {
    console.log("✨ Email queue fully drained. Add more leads to scripts/emails.txt to keep the blast going.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  try {
    await transporter.verify();
    console.log("✓ SMTP ready");
  } catch (err) {
    console.error("✗ SMTP failed:", err.message);
    process.exit(1);
  }

  const BATCH = parseInt(process.env.BATCH_LIMIT || "40", 10);
  const DELAY = parseInt(process.env.DELAY_MS || "20000", 10);
  const toSend = remaining.slice(0, BATCH);
  console.log(`Sending up to ${toSend.length} (after MX check) with ${DELAY / 1000}s delays\n---`);

  let sent = 0;
  let skipped = 0;
  log.failed = [];

  for (const email of toSend) {
    // ── PERMANENT RULE: Skip any domain without a valid MX record ──
    const mxOk = await hasValidMX(email);
    if (!mxOk) {
      console.log(`[SKIP — no MX] ${email}`);
      log.sent.push(email); // mark as done so we never retry dead domains
      skipped++;
      fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
      continue;
    }

    const { subject, text } = emailFor(email);

    try {
      await transporter.sendMail({
        from: `"Abdelrahman Abdelati" <${GMAIL_USER}>`,
        to: email,
        subject,
        text,
        html: htmlFor(text),
        replyTo: GMAIL_USER,
        headers: {
          "List-Unsubscribe": `<mailto:${GMAIL_USER}?subject=unsubscribe>`,
          "Precedence": "bulk",
          "X-Mailer": "CloserAI-Blast/2.0",
        },
      });
      console.log(`[${++sent}/${toSend.length - skipped}] ✓ ${email} — "${subject}"`);
      log.sent.push(email);
    } catch (err) {
      console.error(`[FAIL] ${email}: ${err.message.slice(0, 80)}`);
      log.failed.push(email);
      if (err.message.includes("Invalid login") || err.message.includes("BadCredentials")) {
        console.error("\n⛔ Gmail credentials rejected — stopping batch.");
        break;
      }
    }

    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
    if (sent + skipped < toSend.length) await new Promise((r) => setTimeout(r, DELAY));
  }

  console.log(`\n---\nBatch done. Sent ${sent}, skipped (no MX) ${skipped}. Total sent overall: ${log.sent.length}/${emails.length}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
