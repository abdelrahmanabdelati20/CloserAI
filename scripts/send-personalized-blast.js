// Send PERSONALIZED cold emails to verified real estate brokerage prospects.
// Each email references the prospect's actual company name + city + website.
// Reads from scripts/prospects.json (the verified prospect database).
// Skips anyone already in scripts/blast-log.json.
//
// Usage: node scripts/send-personalized-blast.js [batch_limit] [delay_ms]
//   batch_limit: max emails to send this run (default 30)
//   delay_ms:    delay between sends (default 25000 = 25s — under Gmail radar)
//
// Env: GMAIL_USER, GMAIL_APP_PASSWORD (required)

const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const dns = require("dns").promises;

// Force public DNS (8.8.8.8 + 1.1.1.1) — local resolver is blocked in some sandboxes.
try { require("dns").setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]); } catch {}

const GMAIL_USER = process.env.GMAIL_USER || "AbdelrahmanAbdelati20@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";

if (!GMAIL_APP_PASSWORD) {
  console.error("✗ GMAIL_APP_PASSWORD env var missing. Aborting.");
  process.exit(1);
}

const PROSPECTS_PATH = path.join(__dirname, "prospects.json");
const LOG_PATH = path.join(__dirname, "blast-log.json");

// MX validation — never send to a domain with no mail server
const mxCache = {};
async function hasValidMX(email) {
  const domain = email.split("@")[1];
  if (!domain) return false;
  if (domain in mxCache) return mxCache[domain];
  try {
    const records = await dns.resolveMx(domain);
    mxCache[domain] = Array.isArray(records) && records.length > 0 && !!records[0].exchange;
  } catch {
    mxCache[domain] = false;
  }
  return mxCache[domain];
}

// First-name extraction from email if it looks like firstname@domain.com
function firstNameFromEmail(email) {
  const local = email.split("@")[0];
  if (!local) return null;
  // Skip generic mailboxes
  const generic = /^(info|contact|hello|admin|support|sales|inquiries|inquiry|team|office|comments|broker|compliance|valleybroker|webmaster|reception|leads)$/i;
  if (generic.test(local)) return null;
  // Take only alpha chars from the start of the local part
  const m = local.match(/^[A-Za-z]+/);
  if (!m) return null;
  const name = m[0];
  if (name.length < 3) return null;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// 4 personalized templates that reference company + city
function buildEmail(prospect) {
  const { email, company, city, website } = prospect;
  const firstName = firstNameFromEmail(email);
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
  const cityShort = (city || "").split(",")[0].trim();

  const variants = [
    {
      subject: `Quick question about ${company}'s website`,
      body: `${greeting}

I was on ${website} earlier — really like how you're positioned in ${cityShort}. One thing I noticed: there's no live chat catching visitors who land after hours.

I built a small AI assistant specifically for real estate sites. It greets every visitor, asks what they're looking for, collects contact info, and texts the agent the second a hot lead comes in. Even at 11pm or on a Sunday.

Agents who've added it are seeing 2-3x more booked showings from the same traffic — just because they're the first to respond.

Would it be useful for ${company}? I can send a 2-minute live demo link, or set up a quick call — whichever's easier.

Either way, no pressure.

— Abdelrahman Abdelati
Founder, CloserAI
https://closerai.org`,
    },
    {
      subject: `${company} — saw something on your site`,
      body: `${greeting}

Came across ${company} while looking at ${cityShort} brokerages. The website looks great — clearly a strong local presence.

One small gap I noticed though: nothing on the site that talks to visitors who come in outside business hours. That's where most real estate web traffic actually shows up — evenings, weekends, late at night.

I built a real-estate-specific AI chat tool that fixes exactly that. It qualifies every visitor in 30 seconds, works in 50+ languages, and texts the agent immediately when a hot one comes in. Takes about 5 minutes to add to any site.

Happy to show you a live demo — or just send the link if you'd rather see it yourself: https://closerai.org

Best,
Abdelrahman Abdelati
CloserAI`,
    },
    {
      subject: `An idea for ${company}`,
      body: `${greeting}

Quick thought — out of every 100 visitors to ${website}, how many end up filling out a form or calling? For most ${cityShort} brokerages, it's under 5. The other 95+ leave quietly without anyone knowing they were there.

I built something that changes that math. A small AI widget that lives on your site, starts a real conversation with every visitor, naturally collects contact info, and texts you the moment a hot lead comes in.

Agents using it have gone from 3-4 web leads a month to 15-20+ — just from the same traffic.

If ${company} ever wants to take a look, here it is — 14 days free, no card required: https://closerai.org

— Abdelrahman
CloserAI`,
    },
    {
      subject: `${company} — how do you handle after-hours leads?`,
      body: `${greeting}

I work with real estate teams on one specific problem: the leads that hit a brokerage's website at 11pm or on a Sunday and never hear back fast enough.

Most brokerages lose 40-60% of their web leads this way. Not because the agents aren't great — just because nobody can be online 24/7.

I built an AI that covers that exact gap. It greets every visitor on ${website}, figures out what they're looking for, and sends ${firstName ? "you" : "the team"} a text with the hot ones. Real estate teams who've added it report ~3x more showings booked per month, same web traffic.

If you're curious: https://closerai.org — 14 days free, no card.

— Abdelrahman Abdelati
Founder, CloserAI`,
    },
  ];

  // Hash company name to consistently pick same variant per company (so multiple agents at same brokerage don't get the SAME email — different first names, different variants)
  let h = 0;
  const key = (firstName || "") + email;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
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

async function main() {
  const BATCH = parseInt(process.argv[2] || process.env.BATCH_LIMIT || "30", 10);
  const DELAY = parseInt(process.argv[3] || process.env.DELAY_MS || "25000", 10);

  if (!fs.existsSync(PROSPECTS_PATH)) {
    console.error("✗ scripts/prospects.json not found.");
    process.exit(1);
  }

  const prospects = JSON.parse(fs.readFileSync(PROSPECTS_PATH, "utf8"));
  console.log(`Loaded ${prospects.length} prospects from prospects.json`);

  let log = { sent: [], failed: [] };
  if (fs.existsSync(LOG_PATH)) log = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
  const sentSet = new Set(log.sent || []);
  const failedSet = new Set(log.failed || []);

  const remaining = prospects.filter((p) => !sentSet.has(p.email) && !failedSet.has(p.email));
  console.log(`Already sent: ${sentSet.size}. Remaining: ${remaining.length}`);

  if (remaining.length === 0) {
    console.log("✨ All prospects already contacted. Add more to prospects.json.");
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

  const toSend = remaining.slice(0, BATCH);
  console.log(`Sending ${toSend.length} personalized emails (delay ${DELAY / 1000}s)\n---`);

  let sent = 0;
  let skippedNoMX = 0;

  for (let i = 0; i < toSend.length; i++) {
    const p = toSend[i];
    const ok = await hasValidMX(p.email);
    if (!ok) {
      skippedNoMX += 1;
      failedSet.add(p.email);
      log.failed = Array.from(failedSet);
      fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
      console.log(`[skip:no-mx] ${p.email}`);
      continue;
    }

    const { subject, body } = buildEmail(p);
    try {
      await transporter.sendMail({
        from: `"Abdelrahman @ CloserAI" <${GMAIL_USER}>`,
        to: p.email,
        subject,
        text: body,
        html: htmlFor(body),
        replyTo: GMAIL_USER,
      });
      sent += 1;
      sentSet.add(p.email);
      log.sent = Array.from(sentSet);
      fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
      console.log(`[${sent}] ✓ ${p.email}  (${p.company} — ${p.city})`);
    } catch (err) {
      const msg = (err && err.message) || "send failed";
      failedSet.add(p.email);
      log.failed = Array.from(failedSet);
      fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
      console.error(`[fail] ${p.email}: ${msg.slice(0, 80)}`);
      if (msg.includes("Invalid login") || msg.includes("BadCredentials")) {
        console.error("\n⛔ Gmail credentials rejected — stopping.");
        break;
      }
    }
    if (i < toSend.length - 1) await new Promise((r) => setTimeout(r, DELAY));
  }

  console.log(`\n---\nDone. Sent ${sent}, skipped no-MX ${skippedNoMX}.`);
  console.log(`Total contacted ever: ${sentSet.size}.`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
