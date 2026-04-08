# CloserAI — Payment System Setup Guide

## YOUR PAYPAL ACCOUNT
Email: AbdelrahmanAbdelati20@gmail.com (PayPal Business)

---

## STEP 1: HOW TO COLLECT THE SETUP FEE ($997)

### Option A: PayPal Invoice (Recommended — Most Professional)
1. Log in to paypal.com
2. Go to "Send & Request" > "Create Invoice"
3. Enter client's email
4. Add line item:
   - Description: "CloserAI [Plan Name] Plan — Setup & Configuration Fee"
   - Amount: $997 (or $1,497 for Enterprise)
5. Add note: "Includes AI assistant setup, customization, and onboarding"
6. Send invoice
7. Client pays, you get notified

### Option B: PayPal.me Link (Quick & Easy)
Send the client this link:
https://paypal.me/AbdelrahmanAbdelati20/997USD

They click it, pay, done.

### Option C: Pricing Page (Built Into Your App)
Your app has a pricing page at: yourdomain.com/pricing
Clients can click "Get Started" and it sends them to PayPal to pay.

---

## STEP 2: HOW TO SET UP MONTHLY SUBSCRIPTIONS

### Create PayPal Subscription Plans

1. Go to: https://www.paypal.com/billing/plans
2. Click "Create Plan"
3. Create 3 plans:

**Plan 1 — Starter**
- Plan name: CloserAI Starter
- Price: $297.00 USD
- Billing cycle: Monthly
- Auto-renew: Yes

**Plan 2 — Professional**
- Plan name: CloserAI Professional
- Price: $597.00 USD
- Billing cycle: Monthly
- Auto-renew: Yes

**Plan 3 — Enterprise**
- Plan name: CloserAI Enterprise
- Price: $1,497.00 USD
- Billing cycle: Monthly
- Auto-renew: Yes

4. After creating each plan, PayPal gives you a "Subscribe" button/link
5. Save these links — you'll send them to clients after setup

---

## STEP 3: WHAT TO SEND CLIENTS AFTER SETUP FEE IS PAID

Once a client pays the setup fee:

1. Create their account in your admin panel
2. Send them this email:

---
Subject: Your CloserAI Account Is Ready!

Hi [NAME],

Great news — your CloserAI account is set up and ready to go!

Here are your details:

LOGIN: [YOUR DOMAIN]/login
Email: [THEIR EMAIL]
Password: [THEIR PASSWORD]

NEXT STEPS:
1. Log in and customize your AI (Settings page)
2. Add your property listings (Properties page)
3. Copy the widget code (Dashboard page) and paste it on your website

MONTHLY SUBSCRIPTION:
To keep your AI running, please subscribe to your monthly plan here:
[PAYPAL SUBSCRIPTION LINK FOR THEIR PLAN]

If you need any help with setup, just reply to this email.

Welcome aboard!
[YOUR NAME]
CloserAI
---

---

## STEP 4: WHAT HAPPENS WHEN PAYMENT FAILS

### Automatic (If PayPal Webhooks Are Set Up):
- PayPal sends a webhook to your app
- App automatically deactivates the client's account
- Client's widget stops working
- Client sees "Account deactivated" in their dashboard

### Manual (If You Don't Set Up Webhooks):
1. Check PayPal weekly for failed payments
2. If a client's subscription is overdue:
   - Send them Payment Reminder email (see EMAIL-TEMPLATES.md #12)
   - Wait 48 hours
   - If still unpaid, send Final Warning email (#13)
   - If still unpaid after 24 more hours:
     Go to Admin > Clients > Click "DEACTIVATE SERVICE"

---

## STEP 5: SET UP PAYPAL WEBHOOKS (Optional but Recommended)

This automates everything — when a client stops paying, their
service automatically shuts off.

1. Go to: https://developer.paypal.com/dashboard/
2. Click "My Apps & Credentials"
3. Select your app (or create one)
4. Scroll to "Webhooks" > "Add Webhook"
5. Webhook URL: https://yourdomain.com/api/webhooks/paypal
6. Select these events:
   - BILLING.SUBSCRIPTION.ACTIVATED
   - BILLING.SUBSCRIPTION.SUSPENDED
   - BILLING.SUBSCRIPTION.CANCELLED
   - PAYMENT.SALE.COMPLETED
   - PAYMENT.SALE.DENIED
   - PAYMENT.SALE.REFUNDED
7. Save

Now everything is automatic:
- Client pays -> account stays active
- Client stops paying -> account auto-deactivates
- Client pays again -> account auto-reactivates

---

## REVENUE TRACKING

Keep it simple. Use a spreadsheet:

| Client | Plan | Setup Paid | Monthly $ | Start Date | PayPal Sub ID | Status |
|--------|------|-----------|-----------|------------|---------------|--------|
| Sunshine Realty | Professional | Yes | $597 | Apr 2026 | I-XXXXX | Active |
| ... | ... | ... | ... | ... | ... | ... |

Or just check PayPal's "Reports" section for monthly revenue.

---

## PRICING NEGOTIATION TIPS

- NEVER lower the setup fee below $697. It covers your time.
- If they push on monthly, offer a 20% discount for annual upfront:
  - Starter: $297/mo or $2,851/year (save $413)
  - Professional: $597/mo or $5,731/year (save $433)
- For teams of 5+ agents, offer Enterprise at a team rate
- Always frame cost as: "That's less than one commission check per year"
