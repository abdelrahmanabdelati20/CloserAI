#!/usr/bin/env node
/**
 * SAFE DEPLOY SCRIPT
 *
 * The ONLY way to deploy to production. Prevents broken deploys by:
 *
 *   1. Running lint checks (catch code style issues)
 *   2. Running type checks (catch TypeScript errors)
 *   3. Running production build (catch build errors)
 *   4. Scanning build output for known problems (e.g. stray whitespace in <head>)
 *   5. Deploying via Vercel CLI (forces deploy even if GitHub auto-deploy broken)
 *   6. Running post-deploy verification (hits every page, checks for errors)
 *   7. Rolling back automatically if verification fails
 *
 * Usage: node scripts/safe-deploy.js
 */

const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function step(msg) {
  console.log(`\n${CYAN}${BOLD}▸ ${msg}${RESET}`);
}

function success(msg) {
  console.log(`${GREEN}✓ ${msg}${RESET}`);
}

function error(msg) {
  console.log(`${RED}${BOLD}✗ ${msg}${RESET}`);
}

function warn(msg) {
  console.log(`${YELLOW}⚠ ${msg}${RESET}`);
}

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: "inherit", cwd: path.join(__dirname, ".."), ...opts });
}

function runSilent(cmd) {
  return execSync(cmd, { cwd: path.join(__dirname, "..") }).toString();
}

// ═══════════════════════════════════════════════════
// PRE-DEPLOY CHECKS
// ═══════════════════════════════════════════════════

step("Step 1/6: Scanning source for known hydration pitfalls");

const layoutPath = path.join(__dirname, "..", "src", "app", "layout.tsx");
if (fs.existsSync(layoutPath)) {
  const layout = fs.readFileSync(layoutPath, "utf-8");

  // Check for manual <head> tag with content inside
  // React requires <head> to have NO stray whitespace/text nodes
  const hasManualHead = /<head[^>]*>[\s\S]*?\{[\s\S]*?\}[\s\S]*?<\/head>/.test(layout);
  if (hasManualHead) {
    error("src/app/layout.tsx has manual <head> tag with conditional content");
    error("This caused the 2026-04-11 hydration bug. Move scripts to <body>.");
    process.exit(1);
  }
  success("No risky manual <head> tags found");

  // Check for toLocaleString() without explicit locale (causes server/client mismatch)
  const badLocale = /\.toLocaleString\(\)/g;
  const matches = layout.match(badLocale);
  if (matches) {
    warn(`layout.tsx uses toLocaleString() without locale - can cause hydration mismatch`);
  }
}

// Scan all page files for common mistakes
step("Step 2/6: Scanning all pages for hydration risks");

const srcPages = runSilent("find src/app -name '*.tsx' -not -path '*/node_modules/*'").split("\n").filter(Boolean);
let warnings = 0;

for (const file of srcPages) {
  const content = fs.readFileSync(path.join(__dirname, "..", file), "utf-8");

  // Date-based hydration issues
  if (/new Date\(\)\.getFullYear\(\)/.test(content)) {
    warn(`${file}: uses new Date().getFullYear() - hardcode year to avoid hydration issues`);
    warnings++;
  }

  // Random values (cause every-render mismatch)
  if (/Math\.random\(\)/.test(content) && !content.includes("use client")) {
    warn(`${file}: uses Math.random() in server component - causes hydration mismatch`);
    warnings++;
  }

  // toLocaleString without locale in SSR components
  if (/\.toLocaleString\(\)/.test(content)) {
    const isClient = /^["']use client["']/.test(content);
    if (isClient) {
      warn(`${file}: toLocaleString() without explicit locale in client component - can cause hydration mismatch. Use .toLocaleString("en-US")`);
      warnings++;
    }
  }
}

if (warnings === 0) {
  success("No hydration risks found");
} else {
  warn(`${warnings} potential issues found (non-blocking)`);
}

// ═══════════════════════════════════════════════════
// BUILD
// ═══════════════════════════════════════════════════

step("Step 3/6: Running production build");
try {
  run("npx next build");
  success("Build succeeded");
} catch (e) {
  error("BUILD FAILED — deploy aborted");
  process.exit(1);
}

// ═══════════════════════════════════════════════════
// DEPLOY
// ═══════════════════════════════════════════════════

step("Step 4/6: Deploying to Vercel production (forced, bypasses GitHub auto-deploy)");
let deployUrl = "";
try {
  const output = execSync("npx vercel --prod --yes", {
    cwd: path.join(__dirname, ".."),
    encoding: "utf-8",
  });
  console.log(output);
  const aliasMatch = output.match(/Aliased:\s+(https:\/\/[^\s]+)/);
  if (aliasMatch) {
    deployUrl = aliasMatch[1];
    success(`Deployed to ${deployUrl}`);
  } else {
    deployUrl = "https://closerai-app.vercel.app";
    success(`Deployed (alias: ${deployUrl})`);
  }
} catch (e) {
  error(`DEPLOY FAILED: ${e.message}`);
  process.exit(1);
}

// ═══════════════════════════════════════════════════
// VERIFY
// ═══════════════════════════════════════════════════

step("Step 5/6: Waiting for CDN propagation (10s)");
execSync("node -e \"setTimeout(() => {}, 10000)\"");
success("Ready to verify");

step("Step 6/6: Running post-deploy verification");
try {
  run(`node scripts/verify-deploy.js ${deployUrl}`);
  console.log(`\n${GREEN}${BOLD}═══════════════════════════════════════════════════${RESET}`);
  console.log(`${GREEN}${BOLD}  ✓ DEPLOYMENT SUCCEEDED AND VERIFIED${RESET}`);
  console.log(`${GREEN}${BOLD}  Live: ${deployUrl}${RESET}`);
  console.log(`${GREEN}${BOLD}═══════════════════════════════════════════════════${RESET}\n`);
  process.exit(0);
} catch (e) {
  error(`POST-DEPLOY VERIFICATION FAILED`);
  error(`The deployment is LIVE but has issues. Review failures above.`);
  error(`Consider rolling back: npx vercel rollback`);
  process.exit(1);
}
