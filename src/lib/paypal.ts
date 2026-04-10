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
    price: 297,
    setupFee: 0,
    monthlyLimit: 1000,
    features: [
      "1 Website Widget",
      "1,000 AI Conversations/month",
      "Lead Capture & Management",
      "50+ Languages Support",
      "Email Notifications",
      "Basic Analytics",
    ],
  },
  professional: {
    name: "Professional",
    price: 597,
    setupFee: 0,
    monthlyLimit: 3000,
    features: [
      "5 Website Widgets",
      "3,000 AI Conversations/month",
      "Advanced Lead Scoring",
      "Property Matching AI",
      "CRM Integration Ready",
      "Priority Support (24h)",
      "Custom AI Training",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 1297,
    setupFee: 0,
    monthlyLimit: 10000,
    features: [
      "Unlimited Widgets",
      "10,000 AI Conversations/month",
      "Custom AI Training",
      "White-Label Option",
      "Full API Access",
      "Dedicated Account Manager",
      "Custom Integrations",
    ],
  },
} as const;
