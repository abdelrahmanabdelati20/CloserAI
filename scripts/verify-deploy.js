#!/usr/bin/env node
/**
 * POST-DEPLOY VERIFICATION SCRIPT
 *
 * Hits every public page on LIVE production and verifies:
 *   1. HTTP 200 status
 *   2. Expected content is present (no broken pages)
 *   3. No stray text nodes in <head> (the bug that happened on 2026-04-11)
 *   4. No old pricing references
 *   5. Correct CSS file is linked
 *   6. New PayPal Plan IDs are embedded
 *
 * Exit code 0 = all good, exit code 1 = something is broken.
 *
 * Usage: node scripts/verify-deploy.js [url]
 *   Default URL: https://closerai-app.vercel.app
 */

const BASE_URL = process.argv[2] || "https://closerai-app.vercel.app";

const PAGES = [
  { path: "/", mustContain: ["CloserAI", "Real Estate Lead", "$297", "$0 setup fee"], mustNotContain: ["$997", "$1497", "$1,497"] },
  { path: "/pricing", mustContain: ["Simple, Transparent Pricing", "$297", "$597", "$1,297", "$0 setup fee", "Save 17%", "1,000", "3,000", "10,000"], mustNotContain: ["$997", "$1,497", "500 AI Conversations", "2,000 AI Conversations", "Unlimited Conversations"] },
  { path: "/demo", mustContain: ["Sunshine Realty Group", "Sarah", "$297", "$597", "$1,297"], mustNotContain: ["$997 setup", "$1,497"] },
  { path: "/free-trial", mustContain: ["14-Day Free Trial", "AbdelrahmanAbdelati20@gmail.com"], mustNotContain: ["$1497"] },
  { path: "/get-started", mustContain: ["Choose Your Plan", "$297", "$597", "$1,297", "$0 setup fee", "AbdelrahmanAbdelati20@gmail.com"], mustNotContain: ["$997", "$1,497"] },
  { path: "/trial-expired", mustContain: ["$297", "$597", "$1,297", "AbdelrahmanAbdelati20@gmail.com"], mustNotContain: ["$1,497"] },
  { path: "/login", mustContain: ["CloserAI"] },
];

const API_ENDPOINTS = [
  { path: "/widget.js", mustContain: ["CloserAI", "api/chat"], expectedType: "application/javascript" },
  { path: "/favicon.svg", expectedType: "image/svg" },
  { path: "/logo-pfp-512.png", expectedType: "image/png" },
];

const PAYPAL_PLAN_IDS = {
  new: ["P-3ME68261TF865700ANHMV6VA", "P-2MY58249L8606483BNHMWLZI", "P-25E55064LR4216211NHMWNOA"],
  old: ["P-1LK62020A02608326NHLKVJI", "P-97J20105C8054843BNHLKWRQ", "P-7UV62933RP089234PNHLKXMA"],
};

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

let totalChecks = 0;
let failedChecks = 0;
const failures = [];

function pass(msg) {
  totalChecks++;
  console.log(`  ${GREEN}✓${RESET} ${msg}`);
}

function fail(msg) {
  totalChecks++;
  failedChecks++;
  failures.push(msg);
  console.log(`  ${RED}✗ ${msg}${RESET}`);
}

function warn(msg) {
  console.log(`  ${YELLOW}⚠ ${msg}${RESET}`);
}

async function checkPage(page) {
  console.log(`\n${BOLD}▸ ${page.path}${RESET}`);

  let res, html;
  try {
    res = await fetch(`${BASE_URL}${page.path}?verify=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache" },
    });
    html = await res.text();
  } catch (e) {
    fail(`Fetch failed: ${e.message}`);
    return;
  }

  // Status check
  if (res.status === 200) {
    pass(`HTTP 200`);
  } else {
    fail(`HTTP ${res.status} (expected 200)`);
    return;
  }

  // Normalize HTML by stripping React's template literal separators (<!-- -->)
  // React inserts these between static and dynamic parts of template literals,
  // so "$297" becomes "$<!-- -->297" in server-rendered HTML.
  const normalizedHtml = html.replace(/<!--[^>]*-->/g, "");

  // Must-contain checks (with both raw and comma-free variants to handle formatted numbers)
  for (const text of page.mustContain || []) {
    // Try: exact match, or without comma (handles $1,297 vs $1297)
    const noCommas = text.replace(/,/g, "");
    if (normalizedHtml.includes(text) || normalizedHtml.includes(noCommas)) {
      pass(`Contains "${text}"`);
    } else {
      fail(`MISSING "${text}"`);
    }
  }

  // Must-NOT-contain checks
  for (const text of page.mustNotContain || []) {
    if (!normalizedHtml.includes(text)) {
      pass(`Does not contain "${text}"`);
    } else {
      fail(`SHOULD NOT contain "${text}"`);
    }
  }

  // Head tag check (the bug that caused hydration errors on 2026-04-11)
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/);
  if (headMatch) {
    const head = headMatch[1];
    // Strip all tags, see if any text remains (other than inside <title>)
    const withoutTitle = head.replace(/<title[^>]*>[\s\S]*?<\/title>/g, "");
    const textBetweenTags = withoutTitle.match(/>\s*([^<\s][^<]*?)\s*</g);
    if (textBetweenTags && textBetweenTags.length > 0) {
      const suspiciousText = textBetweenTags.filter((t) => {
        const txt = t.replace(/[><]/g, "").trim();
        return txt.length > 0;
      });
      if (suspiciousText.length > 0) {
        fail(`<head> contains stray text nodes: ${JSON.stringify(suspiciousText.slice(0, 3))}`);
      } else {
        pass(`<head> is clean (no stray text nodes)`);
      }
    } else {
      pass(`<head> is clean (no stray text nodes)`);
    }
  } else {
    fail(`No <head> tag found in HTML`);
  }

  // CSS link check
  const cssMatch = html.match(/href="(\/_next\/static\/css\/[^"]+\.css)"/);
  if (cssMatch) {
    pass(`CSS file linked: ${cssMatch[1].substring(0, 40)}...`);

    // Verify CSS file is actually loadable
    try {
      const cssRes = await fetch(`${BASE_URL}${cssMatch[1]}`);
      if (cssRes.status === 200) {
        const cssSize = (await cssRes.text()).length;
        if (cssSize > 10000) {
          pass(`CSS file loads (${cssSize} bytes)`);
        } else {
          fail(`CSS file too small (${cssSize} bytes) — possible broken build`);
        }
      } else {
        fail(`CSS file returns HTTP ${cssRes.status}`);
      }
    } catch (e) {
      fail(`CSS file fetch failed: ${e.message}`);
    }
  } else {
    fail(`No CSS file linked in HTML`);
  }
}

async function checkAsset(asset) {
  console.log(`\n${BOLD}▸ ${asset.path}${RESET}`);

  try {
    const res = await fetch(`${BASE_URL}${asset.path}?verify=${Date.now()}`);
    if (res.status === 200) {
      pass(`HTTP 200`);
    } else {
      fail(`HTTP ${res.status}`);
      return;
    }

    if (asset.expectedType) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes(asset.expectedType.split("/")[1])) {
        pass(`Content-Type includes "${asset.expectedType.split("/")[1]}"`);
      } else {
        fail(`Content-Type "${contentType}" doesn't include "${asset.expectedType}"`);
      }
    }

    if (asset.mustContain) {
      const text = await res.text();
      for (const str of asset.mustContain) {
        if (text.includes(str)) {
          pass(`Contains "${str}"`);
        } else {
          fail(`MISSING "${str}"`);
        }
      }
    }
  } catch (e) {
    fail(`Fetch failed: ${e.message}`);
  }
}

async function checkPayPalPlanIds() {
  console.log(`\n${BOLD}▸ PayPal Plan IDs in compiled JS${RESET}`);

  try {
    const html = await (await fetch(`${BASE_URL}/get-started`)).text();
    const jsMatch = html.match(/\/_next\/static\/chunks\/app\/get-started[^"]+\.js/);
    if (!jsMatch) {
      fail(`Could not find get-started JS chunk`);
      return;
    }
    const js = await (await fetch(`${BASE_URL}${jsMatch[0]}`)).text();

    for (const newId of PAYPAL_PLAN_IDS.new) {
      if (js.includes(newId)) {
        pass(`New Plan ID present: ${newId}`);
      } else {
        fail(`Missing NEW Plan ID: ${newId}`);
      }
    }

    for (const oldId of PAYPAL_PLAN_IDS.old) {
      if (!js.includes(oldId)) {
        pass(`Old Plan ID gone: ${oldId}`);
      } else {
        fail(`Still contains OLD Plan ID: ${oldId}`);
      }
    }
  } catch (e) {
    fail(`Plan ID check failed: ${e.message}`);
  }
}

async function checkAiApi() {
  console.log(`\n${BOLD}▸ AI Chat API (/api/chat)${RESET}`);

  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: "cai_44d60f6ac0e849d78060792f010730ed",
        message: "Hi, quick test",
      }),
    });

    if (res.status === 200) {
      pass(`HTTP 200`);
      const data = await res.json();
      if (data.message && data.message.length > 10) {
        pass(`AI responded (${data.message.length} chars)`);
      } else {
        fail(`AI response empty or too short`);
      }
      if (data.conversationId) {
        pass(`Returns conversationId`);
      } else {
        fail(`Missing conversationId`);
      }
    } else {
      fail(`HTTP ${res.status}`);
    }
  } catch (e) {
    fail(`AI API check failed: ${e.message}`);
  }
}

(async () => {
  console.log(`${BOLD}═══════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  CLOSERAI DEPLOY VERIFICATION${RESET}`);
  console.log(`${BOLD}  Target: ${BASE_URL}${RESET}`);
  console.log(`${BOLD}═══════════════════════════════════════════════════${RESET}`);

  for (const page of PAGES) {
    await checkPage(page);
  }

  for (const asset of API_ENDPOINTS) {
    await checkAsset(asset);
  }

  await checkPayPalPlanIds();
  await checkAiApi();

  console.log(`\n${BOLD}═══════════════════════════════════════════════════${RESET}`);
  if (failedChecks === 0) {
    console.log(`${GREEN}${BOLD}  ✓ ALL ${totalChecks} CHECKS PASSED — DEPLOYMENT IS HEALTHY${RESET}`);
    console.log(`${BOLD}═══════════════════════════════════════════════════${RESET}`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}  ✗ ${failedChecks} / ${totalChecks} CHECKS FAILED${RESET}`);
    console.log(`${BOLD}═══════════════════════════════════════════════════${RESET}`);
    console.log(`\n${RED}${BOLD}FAILURES:${RESET}`);
    failures.forEach((f) => console.log(`  ${RED}• ${f}${RESET}`));
    console.log("");
    process.exit(1);
  }
})();
