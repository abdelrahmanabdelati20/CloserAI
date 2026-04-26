// Find REAL brokerage emails by:
// 1. Searching Google Maps for "real estate brokerage [city]"
// 2. Extracting business website URLs from the listings
// 3. Visiting each website + /contact + /about + /agents pages
// 4. Pulling visible mailto: emails out of the HTML
// 5. Validating MX records on the domains
// 6. Appending verified emails to scripts/emails.txt
//
// Usage:
//   node scripts/find-real-brokerage-emails.js "Asheville NC" "Boise ID" "Knoxville TN"
//
// Or import the helper functions for use in other scripts.

const fs = require("fs");
const path = require("path");
const dns = require("dns").promises;

const EMAILS_PATH = path.join(__dirname, "emails.txt");
const LOG_PATH = path.join(__dirname, "blast-log.json");
const PROSPECTS_PATH = path.join(__dirname, "prospects.json");

// ─── Helpers ──────────────────────────────────────────────────────

const SAFE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchText(url, timeoutMs = 12000) {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      headers: { "User-Agent": SAFE_UA, Accept: "text/html,*/*" },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return "";
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text") && !ct.includes("html") && !ct.includes("json")) return "";
    return await res.text();
  } catch {
    return "";
  }
}

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

function extractEmails(html) {
  if (!html) return [];
  const matches = html.match(EMAIL_RE) || [];
  const cleaned = matches
    .map((e) => e.toLowerCase().trim())
    // Strip common false-positive patterns: image filenames, CDN domains, framework artifacts
    .filter((e) => !/\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|css|js)$/i.test(e))
    .filter((e) => !/(wixpress|sentry|noreply|no-reply|mailer-daemon|cloudflare|recaptcha|googleapis|googletagmanager|facebook|@2x|@3x|@4x|@example|domain\.com|yourdomain|yoursite|@site\.com|@email\.com|test@|admin@example)/i.test(e))
    .filter((e) => /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(e));
  return Array.from(new Set(cleaned));
}

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

// ─── Google Maps search ───────────────────────────────────────────
// Google Maps doesn't render emails. We use Maps for business names + websites,
// then visit each website to extract emails.

async function searchGoogleMapsBusinesses(query, max = 20) {
  // Google Maps' SSR HTML contains some structured data we can extract.
  // Fallback: use Google Search results (which include "real estate brokerage [city]" page metadata).
  const sites = new Set();
  const searches = [
    `https://www.google.com/search?q=${encodeURIComponent(`real estate brokerage ${query} contact email`)}`,
    `https://www.google.com/search?q=${encodeURIComponent(`real estate ${query} info@ OR contact@`)}`,
    `https://duckduckgo.com/html/?q=${encodeURIComponent(`real estate brokerage ${query} info@ OR contact@`)}`,
  ];
  for (const url of searches) {
    const html = await fetchText(url);
    if (!html) continue;
    const linkRe = /https?:\/\/([a-zA-Z0-9.-]+\.[a-z]{2,})/g;
    let m;
    while ((m = linkRe.exec(html)) !== null) {
      const host = m[1].toLowerCase();
      if (
        host.includes("google.") ||
        host.includes("youtube.") ||
        host.includes("facebook.") ||
        host.includes("instagram.") ||
        host.includes("twitter.") ||
        host.includes("x.com") ||
        host.includes("linkedin.") ||
        host.includes("zillow.") ||
        host.includes("redfin.") ||
        host.includes("realtor.com") ||
        host.includes("trulia.") ||
        host.includes("yelp.") ||
        host.includes("bbb.org") ||
        host.includes("bing.") ||
        host.includes("duckduckgo.") ||
        host.includes("wikipedia.") ||
        host.includes("homes.com") ||
        host.includes("apartments.com") ||
        host.includes("homesnap") ||
        host.includes("compass.com") ||
        host.includes("sothebys") ||
        host.includes("kw.com") ||
        host.includes("kellerwilliams") ||
        host.includes("coldwellbanker") ||
        host.includes("century21.") ||
        host.includes("remax.") ||
        host.includes("berkshirehathaway") ||
        host.includes("exp.com") ||
        host.includes("douglaselliman") ||
        host.includes("gstatic") ||
        host.includes("googleusercontent")
      ) continue;
      sites.add("https://" + host);
      if (sites.size >= max) break;
    }
    if (sites.size >= max) break;
  }
  return Array.from(sites);
}

// ─── Visit website, find emails on key pages ──────────────────────

const PAGE_PATHS = ["", "/contact", "/contact-us", "/contact_us", "/about", "/about-us", "/team", "/agents", "/our-team", "/our-agents", "/staff"];

async function findEmailsOnSite(baseUrl) {
  const found = new Set();
  for (const p of PAGE_PATHS) {
    const url = baseUrl.replace(/\/$/, "") + p;
    const html = await fetchText(url);
    extractEmails(html).forEach((e) => found.add(e));
    if (found.size >= 5) break; // Plenty already
  }
  return Array.from(found);
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  const cities = process.argv.slice(2);
  if (cities.length === 0) {
    console.log("Usage: node find-real-brokerage-emails.js \"Asheville NC\" \"Boise ID\" ...");
    process.exit(1);
  }

  // Load existing prospect store + sent log
  let prospects = [];
  if (fs.existsSync(PROSPECTS_PATH)) {
    try { prospects = JSON.parse(fs.readFileSync(PROSPECTS_PATH, "utf8")); } catch {}
  }
  const knownEmails = new Set(prospects.map((p) => p.email));
  let log = { sent: [], failed: [] };
  if (fs.existsSync(LOG_PATH)) log = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
  log.sent.forEach((e) => knownEmails.add(e));
  log.failed.forEach((e) => knownEmails.add(e));

  let totalNew = 0;

  for (const city of cities) {
    console.log(`\n[${city}] searching for brokerages...`);
    const sites = await searchGoogleMapsBusinesses(city, 25);
    console.log(`[${city}] found ${sites.length} candidate sites`);

    for (const site of sites) {
      // Try to extract a friendly business name from the URL
      const host = site.replace(/^https?:\/\//, "").replace(/^www\./, "");
      const company = host.split(".")[0]
        .replace(/-/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

      const emails = await findEmailsOnSite(site);
      for (const email of emails) {
        if (knownEmails.has(email)) continue;
        const ok = await hasValidMX(email);
        if (!ok) continue;
        // Skip personal gmail/hotmail/yahoo etc — keep brokerage-domain emails only
        if (/@(gmail|yahoo|hotmail|outlook|aol|icloud|protonmail|live|msn|me|mac)\./.test(email)) continue;
        prospects.push({
          email,
          company,
          city,
          website: site,
          source: "google_search+website_scrape",
          discoveredAt: new Date().toISOString(),
        });
        knownEmails.add(email);
        totalNew += 1;
        console.log(`  + ${email}  (${company} — ${city})`);
      }
    }
  }

  // Save prospects + append to emails.txt
  fs.writeFileSync(PROSPECTS_PATH, JSON.stringify(prospects, null, 2));
  const existingEmails = fs.existsSync(EMAILS_PATH)
    ? new Set(fs.readFileSync(EMAILS_PATH, "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean))
    : new Set();
  const fresh = prospects.map((p) => p.email).filter((e) => !existingEmails.has(e));
  if (fresh.length) {
    fs.appendFileSync(EMAILS_PATH, "\n" + fresh.join("\n") + "\n");
  }

  console.log(`\n✓ Done. Added ${totalNew} new verified emails.`);
  console.log(`  Total prospects in DB: ${prospects.length}`);
  console.log(`  scripts/prospects.json updated.`);
  console.log(`  scripts/emails.txt appended with ${fresh.length} fresh entries.`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error("Fatal:", e);
    process.exit(1);
  });
}

module.exports = { extractEmails, hasValidMX, findEmailsOnSite, searchGoogleMapsBusinesses };
