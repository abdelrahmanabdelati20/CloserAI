import crypto from "crypto";

const PAYPAL_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

/**
 * Verify PayPal webhook signature using PayPal's verification API.
 * Returns true if the webhook is authentic, false otherwise.
 */
export async function verifyWebhookSignature(
  headers: Headers,
  body: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  // If no webhook ID configured, log warning and allow (for development)
  if (!webhookId) {
    console.warn("[PayPal] PAYPAL_WEBHOOK_ID not set — skipping signature verification. Set this in production!");
    return true;
  }

  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");
  const transmissionSig = headers.get("paypal-transmission-sig");

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    console.error("[PayPal] Missing webhook signature headers");
    return false;
  }

  try {
    const token = await getAccessToken();

    const verifyRes = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    });

    if (!verifyRes.ok) {
      console.error("[PayPal] Webhook verification API error:", verifyRes.status);
      return false;
    }

    const result = await verifyRes.json();
    const isValid = result.verification_status === "SUCCESS";

    if (!isValid) {
      console.error("[PayPal] Webhook signature verification FAILED:", result.verification_status);
    }

    return isValid;
  } catch (err) {
    console.error("[PayPal] Webhook verification exception:", err);
    return false;
  }
}

/**
 * Generate a unique, human-friendly widget ID for client embed codes.
 * Format: wgt_XXXXXXXX (8 random alphanumeric chars)
 */
export function generateWidgetId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "wgt_";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

export async function verifySubscription(subscriptionId: string) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return {
    id: data.id,
    status: data.status, // ACTIVE, SUSPENDED, CANCELLED, EXPIRED
    planId: data.plan_id,
    startTime: data.start_time,
    nextBillingTime: data.billing_info?.next_billing_time,
  };
}

export async function suspendSubscription(subscriptionId: string, reason: string) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}/suspend`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });

  return res.ok;
}

export async function cancelSubscription(subscriptionId: string, reason: string) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });

  return res.ok;
}

export const PLANS = {
  starter: {
    name: "Starter",
    price: 299,
    setupFee: 997,
    monthlyLimit: 1000,
    features: [
      "1 Website Widget",
      "1,000 AI Conversations/month",
      "Full CRM (Leads + Deals + Tasks + Notes)",
      "Email Drip Campaigns (3 sequences)",
      "Smart Plans (2 automations)",
      "Home Valuations",
      "Landing Page Builder (3 pages)",
      "50+ Languages AI Chat",
      "Property Matching AI",
      "Zapier + Calendar Integrations",
    ],
  },
  professional: {
    name: "Professional",
    price: 799,
    setupFee: 1997,
    monthlyLimit: 3000,
    features: [
      "Everything in Starter, plus:",
      "5 Website Widgets",
      "3,000 AI Conversations/month",
      "Unlimited Email + SMS Campaigns",
      "Power Dialer + Call Log",
      "Unlimited Smart Plans",
      "Transactions + Deal Pipeline",
      "Social Media Scheduler",
      "Team Management (5 agents)",
      "CRM Webhooks (Salesforce, HubSpot, FUB)",
      "Custom AI Training",
      "Priority Support (24h)",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 1999,
    setupFee: 4997,
    monthlyLimit: 10000,
    features: [
      "Everything in Professional, plus:",
      "Unlimited Widgets",
      "10,000 AI Conversations/month",
      "Unlimited Team Members",
      "Unlimited Landing Pages",
      "IDX / MLS Feed (white-glove setup)",
      "White-Label Branding",
      "Full REST API Access",
      "Dedicated Account Manager",
      "Priority Support (4h response)",
      "Lower conversation overage ($0.75/convo)",
    ],
  },
} as const;
