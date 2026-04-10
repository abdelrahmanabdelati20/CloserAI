# Annual PayPal Plans — Step-by-Step Instructions

## 🎯 Goal: Create 3 More Plans for Annual Billing (17% Discount = 2 Months Free)

Annual plans lock in 12 months of revenue upfront and save customers money. This is proven to increase revenue by 30-50% per customer and reduce churn.

## 💰 Financial Impact

| Plan | Monthly × 12 | Annual Price | Customer Saves |
|------|--------------|--------------|----------------|
| Starter | $3,564 | **$2,970** | $594 (17%) |
| Professional | $7,164 | **$5,970** | $1,194 (17%) |
| Enterprise | $15,564 | **$12,970** | $2,594 (17%) |

## 📋 Create Each Annual Plan in PayPal

Go to: **https://www.paypal.com/billing/plans** → Click **"Create Plan"**

---

### PLAN 4: STARTER ANNUAL

**Choose Product:** Select existing `CloserAI Starter`

| Field | Value |
|-------|-------|
| **Plan Name** | `Starter Annual` |
| **Plan Description** | `$2,970/year. Save $594 vs monthly. 1 widget, 1,000 conversations/mo.` |
| **Billing Cycle** | **Yearly** (not Monthly!) |
| **Frequency** | Every 1 year |
| **Price** | `$2,970.00 USD` |
| **Setup Fee** | `$0.00` |
| **Trial** | None |
| **Tax** | 0% |

**Copy the Plan ID** after creating and send to me.

---

### PLAN 5: PROFESSIONAL ANNUAL

**Choose Product:** Select existing `CloserAI Professional`

| Field | Value |
|-------|-------|
| **Plan Name** | `Professional Annual` |
| **Plan Description** | `$5,970/year. Save $1,194 vs monthly. 5 widgets, 3,000 conversations/mo.` |
| **Billing Cycle** | **Yearly** |
| **Frequency** | Every 1 year |
| **Price** | `$5,970.00 USD` |
| **Setup Fee** | `$0.00` |
| **Trial** | None |
| **Tax** | 0% |

---

### PLAN 6: ENTERPRISE ANNUAL

**Choose Product:** Select existing `CloserAI Enterprise`

| Field | Value |
|-------|-------|
| **Plan Name** | `Enterprise Annual` |
| **Plan Description** | `$12,970/year. Save $2,594 vs monthly. Unlimited widgets, 10,000 conversations/mo, white-label.` |
| **Billing Cycle** | **Yearly** |
| **Frequency** | Every 1 year |
| **Price** | `$12,970.00 USD` |
| **Setup Fee** | `$0.00` |
| **Trial** | None |
| **Tax** | 0% |

---

## 📤 After Creating All 3

Send me all 3 new annual Plan IDs (they'll look like `P-XXXXXXXXXXXXXXX`) and I'll:

1. Add them to the `.env` file as `PAYPAL_PLAN_STARTER_ANNUAL`, `PAYPAL_PLAN_PROFESSIONAL_ANNUAL`, `PAYPAL_PLAN_ENTERPRISE_ANNUAL`
2. Update `src/app/get-started/page.tsx` to support annual billing selection
3. Update `src/app/pricing/page.tsx` so clicking the "Annual" toggle actually uses the annual plans (currently it's display-only)
4. Update the PayPal webhook handler to recognize the new annual Plan IDs
5. Build and deploy

## 🎯 Expected Revenue Boost

With annual plans:
- **30% of customers** typically choose annual for the discount
- **Locks in 12 months of revenue** upfront per customer
- **Higher retention** (annual customers churn 50% less than monthly)
- **Better cash flow** (one-time payment vs 12 small payments)

**Estimated impact:** 25-40% increase in total annual revenue from the same number of signups.

---

## ⚠️ Reminder About PayPal Webhook

Don't forget to also configure your webhook in PayPal Developer Dashboard:

1. Go to: **https://developer.paypal.com/dashboard/applications/live**
2. Select your app → Scroll to **Webhooks**
3. Click **Add Webhook**
4. URL: `https://closerai-app.vercel.app/api/webhooks/paypal`
5. Subscribe to these events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`
6. Save

This ensures your website automatically gets notified when:
- A customer subscribes (create their account + send welcome email)
- A customer cancels (deactivate their widget)
- A payment fails (suspend the account)
- A monthly payment succeeds (update their paid-through date)
