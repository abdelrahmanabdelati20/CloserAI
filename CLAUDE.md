# Instructions for Claude Working on CloserAI

**You MUST follow these rules. They exist because of real bugs that cost hours to debug.**

## 🚨 The Golden Rule of Deployment

**NEVER say "deployed" without running `npm run verify` against the LIVE production URL.**

On 2026-04-11, I (Claude) told the user "deployed to Vercel" 4 times in a row when the site was actually broken on production. The user was furious. The fix was adding `scripts/safe-deploy.js` which automates verification.

## The ONE Command to Deploy

```bash
npm run deploy
```

This runs `scripts/safe-deploy.js` which:
1. Scans for hydration pitfalls (manual `<head>`, `toLocaleString` without locale, etc.)
2. Runs production build
3. Force-deploys via `npx vercel --prod --yes` (GitHub auto-deploy is unreliable)
4. Waits for CDN propagation
5. Runs `scripts/verify-deploy.js` against the live URL
6. Exits with error if ANY check fails

**Do NOT use `git push` alone to deploy. GitHub → Vercel auto-deploy is broken.**

## Forbidden Patterns in Code

### ❌ NEVER do this in `src/app/layout.tsx`

```tsx
// BROKEN - causes hydration failure on every page
<head>
  {GA_ID && (
    <>
      <Script .../>
    </>
  )}
</head>
```

### ✅ DO this instead

```tsx
// Put scripts in <body> - Next.js handles <head> automatically via metadata export
<html lang="en">
  <body>
    <Providers>{children}</Providers>
    {GA_ID ? (<>...</>) : null}
  </body>
</html>
```

### ❌ NEVER use these in rendered content

- `new Date().getFullYear()` — hardcode the year
- `new Date().toLocaleString()` — server/client locale mismatch
- `Math.random()` — different value on server vs client
- `typeof window !== 'undefined'` — without `useEffect`
- `.toLocaleString()` — without explicit `"en-US"` locale

### ✅ If you need numeric formatting

```tsx
// ALWAYS specify locale
const formatted = (1234567).toLocaleString("en-US"); // "1,234,567"
```

## Current Production Configuration

- **Live URL:** `https://closerai.org` (canonical)
  - The legacy `closerai-app.vercel.app` subdomain still exists as a Vercel
    deploy alias but middleware 308-redirects every request from it to the
    canonical `closerai.org`. NEVER use `closerai-app.vercel.app` in copy,
    docs, NEXTAUTH_URL, NEXT_PUBLIC_APP_URL, or outreach templates — every
    such reference is a bug.
- **Primary contact email:** `AbdelrahmanAbdelati20@gmail.com`
- **Cold-outreach sender:** `outreach@closerai.org` via Resend (NEVER Gmail SMTP)
- **Pricing:** Starter $297/mo, Professional $597/mo, Enterprise $1,297/mo
- **Setup fee:** $0 (all plans)
- **Conversation limits:** 1,000 / 3,000 / 10,000 per month
- **Trial:** 14 days free, no credit card required

## Current PayPal Plan IDs (Live)

- **Starter:** `P-3ME68261TF865700ANHMV6VA`
- **Professional:** `P-2MY58249L8606483BNHMWLZI`
- **Enterprise:** `P-25E55064LR4216211NHMWNOA`

**Old Plan IDs (must NEVER appear in code):**
- ~~`P-1LK62020A02608326NHLKVJI`~~ (old Starter, $297 + $997 setup)
- ~~`P-97J20105C8054843BNHLKWRQ`~~ (old Professional, $597 + $997 setup)
- ~~`P-7UV62933RP089234PNHLKXMA`~~ (old Enterprise, $1,497 + $1,497 setup)

## Verification Workflow

After ANY code change affecting the UI:

```bash
# 1. Build to catch compile errors
npm run build

# 2. Deploy with automated verification
npm run deploy

# If you want to spot-check without deploying:
npm run verify          # Verifies live production
npm run verify:local    # Verifies localhost:3000
```

## What the Verification Script Checks

See `scripts/verify-deploy.js` for the full list. Key checks:

- **Every page returns HTTP 200** on the LIVE production URL
- **Expected content is present** (new prices, new features)
- **Forbidden content is absent** (old prices, old limits)
- **`<head>` tag is clean** (no stray text nodes — THE bug from 2026-04-11)
- **CSS file loads** and is larger than 10KB (catches empty/broken builds)
- **New PayPal Plan IDs embedded** in compiled JS
- **Old PayPal Plan IDs absent** from compiled JS
- **AI Chat API responds** correctly with a message and conversationId

## If You're About to Say "Deployed"

**STOP. Ask yourself:**

1. Did I run `npm run deploy` (not `git push`)?
2. Did the verification script exit with code 0?
3. Did I actually `curl` or `fetch` the LIVE URL to confirm new content is there?
4. Did I check a FRESH browser tab (not a cached one)?

If you cannot answer YES to all 4, **do NOT claim the deploy is done.**

## When Things Go Wrong

Read `DEPLOYMENT-RULES.md` and follow the troubleshooting section.

Key commands:
```bash
npx vercel ls              # See recent deployments
npx vercel alias ls        # See which deploy the alias points to
npx vercel rollback        # Roll back to previous deploy
npx next build 2>&1 | tail -30   # See build errors
```

## Code Style Notes

- All client components need `"use client"` at the top
- Server components should not use browser APIs
- Always import `Script` from `next/script` for external scripts
- Use `metadata` export for SEO tags, NOT manual `<head>` tags
