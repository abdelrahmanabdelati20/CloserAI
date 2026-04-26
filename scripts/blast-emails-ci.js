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
const DNC_PATH = path.join(__dirname, "dnc-list.txt");

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

// ─── Company name from domain (best-effort, human-readable) ──────
// Goal: "thefirmmemphis.com" → "The Firm Memphis", "redrockrg.com"
// → "Red Rock RG", "208boiserealestate.com" → "208 Boise Real Estate".
// Recognizes common real-estate compound words and inserts spaces.
function getCompanyName(email) {
  const domain = (email.split("@")[1] || "").toLowerCase();
  if (!domain || domain === "gmail.com") return "your team";

  // Strip TLD
  let core = domain.replace(/\.(com|net|org|io|co|us|ai|info|biz|tv)$/i, "");
  // Strip subdomain prefixes that aren't useful
  core = core.replace(/^(www|mail|email|info)\./i, "");
  // Take last segment if there's still a sub (e.g., "boise.kw.com")
  if (core.includes(".")) core = core.split(".").pop();

  // Insert spaces around common real-estate compound words so they read naturally
  const compounds = [
    "realestate", "realty", "homes", "properties", "brokerage",
    "brokers", "broker", "team", "group", "advisors", "associates",
    "company", "house", "boise", "memphis", "tacoma", "knoxville",
    "spokane", "omaha", "louisville", "chattanooga", "asheville",
    "tallahassee", "birmingham", "neworleans", "nola", "dsm",
    "mccarty", "iowarealty", "cope", "cranere", "kw",
  ];
  for (const w of compounds) {
    const re = new RegExp(`(?<=[a-z0-9])${w}(?=[a-z0-9]|$)`, "gi");
    core = core.replace(re, ` ${w} `);
  }

  // Hyphens → spaces, collapse, title-case
  return core
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => {
      // Keep all-caps for short acronyms like "RG", "NAI", "KW"
      if (w.length <= 3 && !/\d/.test(w)) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

// ─── Hash helper for consistent variant selection per domain ──────
function domainHash(email) {
  const domain = email.split("@")[1] || email;
  let h = 0;
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  return h;
}

// ─── Human-written email variants ────────────────────────────────
// Short, plain prose. No spam-trigger words. Written like a quick
// personal note, not a marketing blast. Subject lines stay neutral.
const VARIANTS = [
  {
    subject: () => `quick question about your website`,
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
    subject: () => `saw your real estate site`,
    text: (co) => `Hi,

Came across the ${co} site while looking at brokerages in your market. Solid presence.

One thing I help with specifically: catching the visitors who land on your site at 9pm or on Sunday. Most brokerages lose those — nobody's online to respond fast enough, so they go to whoever does answer first.

I built an AI chat widget for real estate that handles this 24/7, in 50+ languages. It collects contact info naturally and pings the agent on hot leads.

Happy to show you the live demo if you're curious — closerai.org. Takes about 5 minutes to add to any site.

Best,
Abdelrahman Abdelati`,
  },
  {
    subject: () => `idea for your brokerage`,
    text: (co) => `Hi,

Quick thought for the ${co} team: have you ever looked at how many visitors land on your site and leave without filling anything out?

For most brokerages it's over 95%. They quietly disappear and the agents never know they were there.

I built a small AI widget that starts a real conversation with every visitor, qualifies them, and texts the right agent the second someone hot comes in. It's not a chatbot script — it's a real conversation, and it works around the clock.

Worth 10 min to take a look? Just hit closerai.org — try it live, no forms.

Abdelrahman Abdelati
CloserAI`,
  },
  {
    subject: () => `how do you handle after-hours leads?`,
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

  // ─── DNC list (unsubscribed + brand-HQ catch-alls that flag spam) ─
  let dncSet = new Set();
  if (fs.existsSync(DNC_PATH)) {
    dncSet = new Set(
      fs.readFileSync(DNC_PATH, "utf8")
        .split(/\r?\n/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s && !s.startsWith("#"))
    );
    console.log(`Loaded ${dncSet.size} DNC entries`);
  }

  const sentSet = new Set(log.sent);
  const remaining = emails.filter((e) => !sentSet.has(e) && !dncSet.has(e.toLowerCase()));
  const dncBlocked = emails.filter((e) => dncSet.has(e.toLowerCase())).length;
  console.log(`Already sent: ${log.sent.length}. DNC-blocked: ${dncBlocked}. To send now: ${remaining.length}`);

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

  // Personal Gmail caps cold-outreach reputation hard above ~50/day.
  // Lower volume + jittered delay = better inbox placement.
  const BATCH = parseInt(process.env.BATCH_LIMIT || "40", 10);
  const DELAY_MIN = parseInt(process.env.DELAY_MIN_MS || "30000", 10);
  const DELAY_MAX = parseInt(process.env.DELAY_MAX_MS || "75000", 10);
  const jitterDelay = () =>
    DELAY_MIN + Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN));
  const toSend = remaining.slice(0, BATCH);
  console.log(`Sending up to ${toSend.length} (after MX check) with ${DELAY_MIN/1000}-${DELAY_MAX/1000}s jittered delays\n---`);

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
          // mailto unsubscribe — recipient sends a one-line "unsubscribe" reply
          // and we add them to scripts/dnc-list.txt manually. No spammy
          // Precedence:bulk or "Blast" X-Mailer headers — those land in spam.
          "List-Unsubscribe": `<mailto:${GMAIL_USER}?subject=unsubscribe>`,
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
    if (sent + skipped < toSend.length) await new Promise((r) => setTimeout(r, jitterDelay()));
  }

  console.log(`\n---\nBatch done. Sent ${sent}, skipped (no MX) ${skipped}. Total sent overall: ${log.sent.length}/${emails.length}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
