// CI-friendly version of blast-emails.js for GitHub Actions.
// Reads GMAIL_USER + GMAIL_APP_PASSWORD from env vars (NOT hardcoded).
// Everything else mirrors blast-emails.js so logs stay compatible.

const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const GMAIL_USER = process.env.GMAIL_USER || "AbdelrahmanAbdelati20@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";

if (!GMAIL_APP_PASSWORD) {
  console.error("✗ GMAIL_APP_PASSWORD env var missing. Aborting.");
  process.exit(1);
}

const EMAILS_PATH = path.join(__dirname, "emails.txt");
const LOG_PATH = path.join(__dirname, "blast-log.json");

function getCompanyName(email) {
  const domain = email.split("@")[1];
  if (!domain || domain === "gmail.com") return "your brokerage";
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

const SUBJECTS = [
  "Quick question about {{company}}",
  "Idea for {{company}}'s website leads",
  "{{company}} — noticed something on your site",
  "For {{company}} — free 14 days of AI lead capture",
  "How {{company}} can 3x website leads",
];

function subjectFor(company) {
  return SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)].replace("{{company}}", company);
}

function bodyFor(company) {
  return `Hi there,

I came across ${company} while researching top brokerages — really impressive work.

Quick question: do you ever lose website visitors because nobody gets back to them in time?

It's the #1 complaint I hear from agents. I built something that fixes it — a tiny AI chat widget that sits on your site and talks to every visitor 24/7. It qualifies them, collects contact info, books showings into your calendar, and texts you the hot leads immediately.

The agents using it are seeing 3x more booked showings from the same traffic.

I'm offering a free 14-day trial, no credit card, no setup fee. Takes 2 minutes to install — I can walk you through it if that helps.

Try it here: https://closerai-app.vercel.app

If it's not for you, no worries at all — just hit reply and let me know. I won't follow up again.

Best,
Abdelrahman Abdelati
Founder, CloserAI
https://closerai-app.vercel.app
`;
}

function htmlFor(company) {
  const text = bodyFor(company);
  return text
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 16px 0;line-height:1.5;color:#222;font-family:Arial,sans-serif;font-size:15px;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
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
  console.log(`Sending ${toSend.length} with ${DELAY / 1000}s delays\n---`);

  let sent = 0;
  log.failed = [];

  for (const email of toSend) {
    const company = getCompanyName(email);
    const subject = subjectFor(company);

    try {
      await transporter.sendMail({
        from: `"Abdelrahman @ CloserAI" <${GMAIL_USER}>`,
        to: email,
        subject,
        text: bodyFor(company),
        html: htmlFor(company),
        replyTo: GMAIL_USER,
      });
      console.log(`[${++sent}/${toSend.length}] ✓ ${email} — "${subject}"`);
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
    if (sent < toSend.length) await new Promise((r) => setTimeout(r, DELAY));
  }

  console.log(`\n---\nBatch done. Sent ${sent}. Total sent overall: ${log.sent.length}/${emails.length}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
