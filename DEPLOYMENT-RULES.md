# CloserAI Deployment Rules — MANDATORY

**READ THIS BEFORE EVERY DEPLOYMENT. NO EXCEPTIONS.**

## 🚫 What Went Wrong (2026-04-11)

On 2026-04-11, the site rendered as unstyled HTML because I:
1. Added a manual `<head>` tag in `layout.tsx` with conditional JSX content
2. The whitespace between JSX tags created invalid text nodes inside `<head>`
3. React hydration failed → server HTML was thrown away → CSS stopped applying
4. I said "deployed" without verifying the live site actually worked
5. Vercel's GitHub auto-deploy was also broken, so `git push` wasn't deploying anything

## ✅ The One Command You Use to Deploy

```bash
npm run deploy
```

**This runs `scripts/safe-deploy.js` which does ALL of this automatically:**

1. **Scans source files** for known hydration pitfalls:
   - Manual `<head>` tags with conditional content
   - `toLocaleString()` without explicit locale in client components
   - `Math.random()` in server components
   - `new Date().getFullYear()` in SSR

2. **Runs production build** — catches build errors before deploying

3. **Deploys via Vercel CLI** (`npx vercel --prod --yes`) — bypasses the broken GitHub auto-deploy

4. **Waits 10 seconds** for CDN propagation

5. **Runs post-deploy verification** that hits EVERY page on the LIVE site and checks:
   - HTTP 200 status
   - Expected content present ($297, $597, $1,297, etc.)
   - No old content ($997, $1,497, 500 conversations, etc.)
   - `<head>` tag has no stray text nodes (THE bug)
   - CSS file loads and is >10KB
   - New PayPal Plan IDs embedded in JS
   - Old PayPal Plan IDs completely gone
   - AI Chat API responds correctly

6. **Fails loudly** if anything is broken so you know before the user does

## 🛑 NEVER DO THESE

- ❌ **Never** use `git push` alone to deploy (GitHub auto-deploy is unreliable)
- ❌ **Never** say "deployed" without running `npm run verify`
- ❌ **Never** trust local preview as proof the live site works
- ❌ **Never** add manual `<head>` tags in `layout.tsx` with conditional JSX
- ❌ **Never** use `toLocaleString()` without `"en-US"` locale in client components
- ❌ **Never** use `new Date()` to render UI (hardcode or fetch dynamically)
- ❌ **Never** use `Math.random()` in server-rendered content

## ✅ ALWAYS DO THESE

- ✅ **Always** use `npm run deploy` for production deployments
- ✅ **Always** use `npm run verify` to spot-check live site after manual changes
- ✅ **Always** test in an Incognito window for fresh-browser verification
- ✅ **Always** put `"use client"` at the top of any component with state/effects
- ✅ **Always** use `toLocaleString("en-US")` when formatting numbers

## 📋 The Verification Script in Detail

`scripts/verify-deploy.js` checks:

### Pages verified
- `/` (landing)
- `/pricing`
- `/demo`
- `/free-trial`
- `/get-started`
- `/trial-expired`
- `/login`

### For each page
- HTTP status is 200
- Expected content is present
- Forbidden content is absent (old prices/limits)
- `<head>` tag is clean (the bug that broke everything)
- CSS file is linked AND loads AND is > 10KB

### Assets verified
- `/widget.js` — 200 OK, correct Content-Type, contains "CloserAI" and "api/chat"
- `/favicon.svg` — 200 OK, SVG
- `/logo-pfp-512.png` — 200 OK, PNG

### PayPal verification
- All 3 NEW Plan IDs present in compiled JS:
  - `P-3ME68261TF865700ANHMV6VA` (Starter)
  - `P-2MY58249L8606483BNHMWLZI` (Professional)
  - `P-25E55064LR4216211NHMWNOA` (Enterprise)
- All 3 OLD Plan IDs completely absent:
  - `P-1LK62020A02608326NHLKVJI`
  - `P-97J20105C8054843BNHLKWRQ`
  - `P-7UV62933RP089234PNHLKXMA`

### AI API verification
- `/api/chat` responds with HTTP 200
- Returns a `message` with > 10 chars
- Returns a `conversationId`

## 🚨 What to Do When Verification Fails

If `npm run verify` returns exit code 1:

1. **Read the failures** — each is listed with `✗` and the specific problem
2. **Fix the issue** in source code
3. **Re-run `npm run deploy`** — this will rebuild, redeploy, and re-verify
4. If the issue persists, check:
   - Is Vercel actually deploying? (`npx vercel ls`)
   - Is the alias pointing to the latest deployment? (`npx vercel alias ls`)
   - Is there a build error? (`npm run build`)

## 🎯 Quick Reference

```bash
# Deploy (the ONLY way)
npm run deploy

# Verify live production
npm run verify

# Verify local dev server
npm run verify:local

# Quick deploy (skips pre-checks, still verifies after)
npm run deploy:quick

# Manual Vercel operations
npx vercel ls                    # List deployments
npx vercel alias ls              # Show which deploy is live
npx vercel --prod --yes          # Force deploy
npx vercel rollback              # Rollback to previous deploy
```

## 📜 History of Bugs Caught by This System

- **2026-04-11:** Manual `<head>` with conditional JSX → invalid text nodes → hydration failure → unstyled HTML (would have been caught by step 1 of safe-deploy)
- **2026-04-11:** `toLocaleString()` without locale → server/client format mismatch → hydration error (would have been caught by step 2 of safe-deploy)
- **2026-04-11:** Vercel GitHub auto-deploy stopped working silently → commits pushed but never deployed (would have been caught by verification failing on OLD content)

**The safeguards exist because these exact bugs cost hours of frustration. Never remove them.**
