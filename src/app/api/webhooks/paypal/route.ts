import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createNotification } from "@/lib/notifications";
import { verifyWebhookSignature, generateWidgetId } from "@/lib/paypal";

// Map PayPal Plan IDs to internal plan tiers (v-FINAL pricing)
const PLAN_MAP: Record<string, { name: string; limit: number; price: number }> = {
  // Monthly plans (existing active PayPal plan IDs)
  "P-3ME68261TF865700ANHMV6VA": { name: "starter", limit: 1000, price: 299 },
  "P-2MY58249L8606483BNHMWLZI": { name: "professional", limit: 3000, price: 799 },
  "P-25E55064LR4216211NHMWNOA": { name: "enterprise", limit: 10000, price: 1999 },
  // Annual plans
  "P-2J09452604397282GNHO4GSQ": { name: "starter", limit: 1000, price: 2990 },
  "P-93R54480Y01739649NHO4HXY": { name: "professional", limit: 3000, price: 7990 },
  "P-7KN90917L04901723NHO4JCQ": { name: "enterprise", limit: 10000, price: 19990 },
};

function getPlanInfo(planId: string): { name: string; limit: number; price: number } {
  if (PLAN_MAP[planId]) return PLAN_MAP[planId];

  if (planId === process.env.PAYPAL_PLAN_STARTER) return { name: "starter", limit: 1000, price: 299 };
  if (planId === process.env.PAYPAL_PLAN_PROFESSIONAL) return { name: "professional", limit: 3000, price: 799 };
  if (planId === process.env.PAYPAL_PLAN_ENTERPRISE) return { name: "enterprise", limit: 10000, price: 1999 };

  if (planId === process.env.PAYPAL_PLAN_STARTER_ANNUAL) return { name: "starter", limit: 1000, price: 2990 };
  if (planId === process.env.PAYPAL_PLAN_PROFESSIONAL_ANNUAL) return { name: "professional", limit: 3000, price: 7990 };
  if (planId === process.env.PAYPAL_PLAN_ENTERPRISE_ANNUAL) return { name: "enterprise", limit: 10000, price: 19990 };

  return { name: "starter", limit: 1000, price: 0 };
}

/**
 * Send welcome email with login credentials and widget install code.
 */
async function sendWelcomeEmail(
  email: string,
  name: string,
  password: string,
  apiKey: string,
  widgetId: string,
  plan: string
) {
  const emailApiKey = process.env.RESEND_API_KEY;
  if (!emailApiKey) {
    console.log("[Webhook] WELCOME EMAIL (email service not configured):", { email, apiKey, widgetId });
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://closerai-app.vercel.app";

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%);color:white;padding:30px;border-radius:16px 16px 0 0;text-align:center;">
    <h1 style="margin:0 0 8px;font-size:28px;">Welcome to CloserAI!</h1>
    <p style="margin:0;opacity:0.9;font-size:16px;">${name}, your AI-powered lead engine is ready.</p>
  </div>

  <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-top:0;">
    <h2 style="color:#1e3a5f;margin-top:0;">Your Login Credentials</h2>
    <table style="width:100%;background:#f9fafb;border-radius:8px;padding:15px;">
      <tr><td style="padding:8px;font-weight:bold;color:#374151;">Login URL:</td><td style="padding:8px;"><a href="${appUrl}/login" style="color:#2563eb;">${appUrl}/login</a></td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#374151;">Email:</td><td style="padding:8px;">${email}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#374151;">Password:</td><td style="padding:8px;font-family:monospace;background:#fff;border-radius:4px;">${password}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#374151;">Plan:</td><td style="padding:8px;text-transform:capitalize;">${plan}</td></tr>
    </table>
    <p style="font-size:13px;color:#6b7280;margin-top:8px;">Please change your password after your first login.</p>

    <h2 style="color:#1e3a5f;">Install Your AI Widget</h2>
    <p style="color:#374151;">Copy this code and paste it before the closing <code>&lt;/body&gt;</code> tag on your website:</p>
    <div style="background:#1e293b;border-radius:8px;padding:20px;margin:15px 0;">
      <code style="color:#22d3ee;font-size:14px;word-break:break-all;">&lt;script src="${appUrl}/widget.js" data-api-key="${apiKey}"&gt;&lt;/script&gt;</code>
    </div>
    <p style="font-size:13px;color:#6b7280;">Works on WordPress, Wix, Squarespace, Webflow, and any custom HTML site.</p>

    <h2 style="color:#1e3a5f;">Your Quick Start Checklist</h2>
    <ol style="color:#374151;line-height:1.8;">
      <li>Log in to your <a href="${appUrl}/dashboard" style="color:#2563eb;">dashboard</a></li>
      <li>Go to Settings and customize your AI agent name, welcome message, and brand color</li>
      <li>Add your property listings (manual entry, CSV upload, or auto-import)</li>
      <li>Copy the widget code above and paste it on your website</li>
      <li>Your AI is now capturing leads 24/7!</li>
    </ol>

    <div style="margin-top:30px;text-align:center;">
      <a href="${appUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#3b82f6);color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">Go to Your Dashboard</a>
    </div>
  </div>

  <div style="background:#f9fafb;padding:20px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 16px 16px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:13px;">Need help? Reply to this email anytime. We typically respond within 2 hours.</p>
    <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">CloserAI - AI-Powered Real Estate Lead Conversion</p>
  </div>
</body>
</html>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${emailApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "CloserAI <welcome@closerai-app.vercel.app>",
        to: email,
        subject: `Welcome to CloserAI - Your Account is Ready!`,
        html,
      }),
    });
  } catch (err) {
    console.error("[Webhook] Failed to send welcome email:", err);
  }
}

/**
 * PayPal Webhook Handler
 *
 * Listens for subscription lifecycle events and auto-provisions/manages client accounts.
 *
 * Events handled:
 * - BILLING.SUBSCRIPTION.ACTIVATED  -> Create or reactivate client account
 * - BILLING.SUBSCRIPTION.SUSPENDED  -> Pause client (payment failed)
 * - BILLING.SUBSCRIPTION.CANCELLED  -> Deactivate client
 * - BILLING.SUBSCRIPTION.EXPIRED    -> Deactivate client
 * - PAYMENT.SALE.COMPLETED          -> Reactivate on successful recurring payment
 * - PAYMENT.SALE.DENIED/REFUNDED    -> Suspend client
 */
export async function POST(req: Request) {
  let rawBody: string;

  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Verify webhook signature (production security)
  const isValid = await verifyWebhookSignature(req.headers, rawBody);
  if (!isValid) {
    console.error("[Webhook] REJECTED: Invalid PayPal webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody);
    const eventType: string = body.event_type;
    const resource = body.resource;

    console.log(`[Webhook] Received: ${eventType} (ID: ${body.id})`);

    switch (eventType) {
      // ── Subscription Activated ──────────────────────────────────────────
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subId: string = resource.id;
        const planId: string = resource.plan_id;
        const subscriberEmail: string | undefined = resource.subscriber?.email_address;
        const subscriberName = `${resource.subscriber?.name?.given_name || ""} ${resource.subscriber?.name?.surname || ""}`.trim() || "Client";
        const plan = getPlanInfo(planId);

        console.log(`[Webhook] Subscription activated: ${subId}, plan: ${plan.name}, email: ${subscriberEmail}`);

        // Create admin notification
        await createNotification({
          type: "new_payment",
          title: `New paying client: ${subscriberName}`,
          message: `${subscriberName} (${subscriberEmail || "unknown"}) subscribed to the ${plan.name} plan at $${plan.price}/month.`,
          metadata: {
            Customer: subscriberName,
            Email: subscriberEmail || "Not provided",
            Plan: `${plan.name} ($${plan.price}/month)`,
            "Conversation Limit": `${plan.limit.toLocaleString("en-US")}/month`,
            "Subscription ID": subId,
            "Plan ID": planId,
          },
        });

        // Check if this subscription ID is already linked to a client
        const existingBySub = await prisma.client.findFirst({ where: { paypalSubId: subId } });

        if (existingBySub) {
          // Reactivate existing client with ALL plan features
          await prisma.client.update({
            where: { id: existingBySub.id },
            data: {
              paypalStatus: "active",
              isActive: true,
              plan: plan.name,
              monthlyLimit: plan.limit,
              whiteLabel: plan.name === "enterprise",
              trialEndsAt: null,
            },
          });
          console.log(`[Webhook] Reactivated existing client: ${existingBySub.id}`);
          break;
        }

        if (!subscriberEmail) {
          console.warn("[Webhook] No subscriber email in ACTIVATED event — cannot auto-provision");
          break;
        }

        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: subscriberEmail },
          include: { client: true },
        });

        if (existingUser && existingUser.client) {
          // User exists with a client record — upgrade/link the subscription with ALL plan features
          await prisma.client.update({
            where: { id: existingUser.client.id },
            data: {
              isActive: true,
              paypalSubId: subId,
              paypalStatus: "active",
              plan: plan.name,
              monthlyLimit: plan.limit,
              whiteLabel: plan.name === "enterprise",
              // Clear trial if they were on one
              trialEndsAt: null,
            },
          });
          console.log(`[Webhook] Linked subscription to existing client: ${existingUser.client.id}`);

          // Send upgrade confirmation email
          try {
            const emailApiKey = process.env.RESEND_API_KEY;
            if (emailApiKey) {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://closerai-app.vercel.app";
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: { Authorization: `Bearer ${emailApiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                  from: "CloserAI <welcome@closerai-app.vercel.app>",
                  to: subscriberEmail,
                  subject: `Your CloserAI ${plan.name} plan is now active!`,
                  html: `
                    <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                      <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%);color:white;padding:30px;border-radius:16px 16px 0 0;text-align:center;">
                        <h1 style="margin:0 0 8px;font-size:28px;">Welcome to ${plan.name}!</h1>
                        <p style="margin:0;opacity:0.9;">Your subscription is active. AI widget is live 24/7.</p>
                      </div>
                      <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 16px 16px;">
                        <h2 style="color:#1e3a5f;margin-top:0;">Your ${plan.name} Plan Includes:</h2>
                        <ul style="line-height:2;color:#374151;">
                          <li>${plan.limit.toLocaleString("en-US")} AI conversations/month</li>
                          ${plan.name === "professional" || plan.name === "enterprise" ? "<li>Advanced lead scoring & analytics</li>" : ""}
                          ${plan.name === "professional" || plan.name === "enterprise" ? "<li>CRM/Zapier webhook integration</li>" : ""}
                          ${plan.name === "professional" || plan.name === "enterprise" ? "<li>SMS & email alerts</li>" : ""}
                          ${plan.name === "professional" ? "<li>Up to 5 website widgets</li>" : ""}
                          ${plan.name === "enterprise" ? "<li>Unlimited website widgets</li>" : ""}
                          ${plan.name === "enterprise" ? "<li>White-label branding (remove CloserAI branding)</li>" : ""}
                          ${plan.name === "enterprise" ? "<li>Full API access</li>" : ""}
                        </ul>
                        <div style="margin-top:20px;text-align:center;">
                          <a href="${appUrl}/dashboard/settings" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#3b82f6);color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;">Configure Your Features</a>
                        </div>
                      </div>
                    </div>`,
                }),
              });
            }
          } catch (e) { console.error("[Webhook] Upgrade email failed:", e); }
        } else {
          // Fully new user — auto-provision account
          const password = generateSecurePassword();
          const passwordHash = await hash(password, 12);
          const apiKey = `cai_${uuidv4().replace(/-/g, "")}`;
          const widgetId = generateWidgetId();

          const user = await prisma.user.create({
            data: {
              id: uuidv4(),
              email: subscriberEmail,
              passwordHash,
              name: subscriberName,
              role: "client",
              client: {
                create: {
                  id: uuidv4(),
                  businessName: subscriberName,
                  widgetId,
                  apiKey,
                  plan: plan.name,
                  monthlyLimit: plan.limit,
                  isActive: true,
                  paypalSubId: subId,
                  paypalStatus: "active",
                  notifyEmail: subscriberEmail,
                  agentName: "AI Assistant",
                  welcomeMessage: `Hi! I'm your AI real estate assistant. How can I help you find your dream property?`,
                  whiteLabel: plan.name === "enterprise",
                },
              },
            },
            include: { client: true },
          });

          console.log(`[Webhook] Auto-provisioned new client: ${user.client!.id}, widgetId: ${widgetId}`);

          // Send welcome email with credentials and widget code
          await sendWelcomeEmail(subscriberEmail, subscriberName, password, apiKey, widgetId, plan.name);
        }
        break;
      }

      // ── Subscription Suspended (payment failed) ────────────────────────
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const subId: string = resource.id;
        const client = await prisma.client.findFirst({
          where: { paypalSubId: subId },
          include: { user: true },
        });

        await prisma.client.updateMany({
          where: { paypalSubId: subId },
          data: { paypalStatus: "suspended", isActive: false },
        });

        if (client) {
          await createNotification({
            type: "payment_failed",
            title: `Payment failed: ${client.businessName}`,
            message: `Payment failed for ${client.businessName} (${client.user.email}). Account auto-suspended. They need to update their payment method.`,
            metadata: {
              Client: client.businessName,
              Email: client.user.email,
              Plan: client.plan,
              "Subscription ID": subId,
            },
          });
          console.log(`[Webhook] Suspended client: ${client.id} (${client.businessName})`);
        }
        break;
      }

      // ── Subscription Cancelled ─────────────────────────────────────────
      case "BILLING.SUBSCRIPTION.CANCELLED": {
        const subId: string = resource.id;
        const client = await prisma.client.findFirst({
          where: { paypalSubId: subId },
          include: { user: true },
        });

        await prisma.client.updateMany({
          where: { paypalSubId: subId },
          data: { paypalStatus: "cancelled", isActive: false },
        });

        if (client) {
          await createNotification({
            type: "subscription_cancelled",
            title: `Subscription cancelled: ${client.businessName}`,
            message: `${client.businessName} (${client.user.email}) cancelled their ${client.plan} subscription. Account deactivated.`,
            metadata: {
              Client: client.businessName,
              Email: client.user.email,
              Plan: client.plan,
            },
          });
          console.log(`[Webhook] Cancelled client: ${client.id} (${client.businessName})`);
        }
        break;
      }

      // ── Subscription Expired ───────────────────────────────────────────
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const subId: string = resource.id;
        await prisma.client.updateMany({
          where: { paypalSubId: subId },
          data: { paypalStatus: "expired", isActive: false },
        });
        console.log(`[Webhook] Expired subscription: ${subId}`);
        break;
      }

      // ── Recurring Payment Succeeded ────────────────────────────────────
      case "PAYMENT.SALE.COMPLETED": {
        const subId: string | undefined = resource.billing_agreement_id;
        if (subId) {
          await prisma.client.updateMany({
            where: { paypalSubId: subId },
            data: { paypalStatus: "active", isActive: true },
          });
          console.log(`[Webhook] Payment completed for subscription: ${subId}`);
        }
        break;
      }

      // ── Payment Failed or Refunded ─────────────────────────────────────
      case "PAYMENT.SALE.DENIED":
      case "PAYMENT.SALE.REFUNDED": {
        const subId: string | undefined = resource.billing_agreement_id;
        if (subId) {
          await prisma.client.updateMany({
            where: { paypalSubId: subId },
            data: { paypalStatus: "suspended", isActive: false },
          });
          console.log(`[Webhook] Payment ${eventType} for subscription: ${subId}`);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/**
 * Generate a secure random password for auto-provisioned accounts.
 */
function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd + "!A1";
}
