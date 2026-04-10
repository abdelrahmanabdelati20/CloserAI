import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createNotification } from "@/lib/notifications";

const PLAN_PRICES: Record<string, number> = {
  "P-3ME68261TF865700ANHMV6VA": 297,
  "P-2MY58249L8606483BNHMWLZI": 597,
  "P-25E55064LR4216211NHMWNOA": 1297,
};

const PLANS: Record<string, { limit: number; name: string }> = {
  "P-3ME68261TF865700ANHMV6VA": { limit: 1000, name: "starter" },
  "P-2MY58249L8606483BNHMWLZI": { limit: 3000, name: "professional" },
  "P-25E55064LR4216211NHMWNOA": { limit: 10000, name: "enterprise" },
};

async function sendWelcomeEmail(email: string, name: string, password: string, apiKey: string) {
  const emailApiKey = process.env.RESEND_API_KEY;
  if (!emailApiKey) {
    console.log("WELCOME EMAIL (email service not configured):", { email, password, apiKey });
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://closerai-app.vercel.app";

  const html = `
<h1>Welcome to CloserAI, ${name}!</h1>
<p>Your payment was successful and your account is ready.</p>

<h2>Your Login Details:</h2>
<p>
<strong>Login URL:</strong> <a href="${appUrl}/login">${appUrl}/login</a><br>
<strong>Email:</strong> ${email}<br>
<strong>Password:</strong> ${password}
</p>
<p><em>Please change your password after logging in.</em></p>

<h2>Your Widget Code (copy this to your website):</h2>
<pre style="background:#f4f4f4;padding:15px;border-radius:5px">
&lt;script src="${appUrl}/widget.js" data-api-key="${apiKey}"&gt;&lt;/script&gt;
</pre>

<h2>Next Steps:</h2>
<ol>
<li>Log in to your dashboard</li>
<li>Go to Settings and customize your AI agent (name, welcome message, colors)</li>
<li>Add your property listings (manually, CSV upload, or auto-import from your website)</li>
<li>Copy the widget code and paste it on your website before &lt;/body&gt;</li>
<li>Your AI is now capturing leads 24/7!</li>
</ol>

<p>Need help? Reply to this email anytime.</p>
<p>Welcome aboard!<br>The CloserAI Team</p>
`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${emailApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "CloserAI <welcome@closerai-app.vercel.app>",
      to: email,
      subject: "Welcome to CloserAI - Your Account is Ready!",
      html,
    }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = body.event_type;
    const resource = body.resource;

    console.log("PayPal Webhook:", eventType);

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subId = resource.id;
        const planId = resource.plan_id;
        const subscriberEmail = resource.subscriber?.email_address;
        const subscriberName = `${resource.subscriber?.name?.given_name || ""} ${resource.subscriber?.name?.surname || ""}`.trim() || "Client";
        const planPrice = PLAN_PRICES[planId] || 0;

        // Create notification for new payment
        await createNotification({
          type: "new_payment",
          title: `💰 NEW PAYING CLIENT: ${subscriberName}`,
          message: `${subscriberName} (${subscriberEmail}) just subscribed for $${planPrice}/month. This is real revenue!`,
          metadata: {
            Customer: subscriberName,
            Email: subscriberEmail || "Not provided",
            Plan: `$${planPrice}/month`,
            "Subscription ID": subId,
            "Plan ID": planId,
          },
        });

        // Try to find existing client
        const existing = await prisma.client.findFirst({ where: { paypalSubId: subId } });

        if (existing) {
          await prisma.client.update({
            where: { id: existing.id },
            data: { paypalStatus: "active", isActive: true },
          });
        } else if (subscriberEmail) {
          // Auto-create account
          const plan = PLANS[planId] || { limit: 1000, name: "starter" };
          const password = Math.random().toString(36).slice(-10) + "!A1";
          const passwordHash = await hash(password, 12);
          const apiKey = `cai_${uuidv4().replace(/-/g, "")}`;

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({ where: { email: subscriberEmail } });

          if (existingUser) {
            // Link to existing user
            const existingClient = await prisma.client.findUnique({ where: { userId: existingUser.id } });
            if (existingClient) {
              await prisma.client.update({
                where: { id: existingClient.id },
                data: {
                  isActive: true,
                  paypalSubId: subId,
                  paypalStatus: "active",
                  plan: plan.name,
                  monthlyLimit: plan.limit,
                },
              });
            }
          } else {
            // Create new account
            await prisma.user.create({
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
                    apiKey,
                    plan: plan.name,
                    monthlyLimit: plan.limit,
                    isActive: true,
                    paypalSubId: subId,
                    paypalStatus: "active",
                    notifyEmail: subscriberEmail,
                  },
                },
              },
            });

            await sendWelcomeEmail(subscriberEmail, subscriberName, password, apiKey);
          }
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const client = await prisma.client.findFirst({ where: { paypalSubId: resource.id }, include: { user: true } });
        await prisma.client.updateMany({
          where: { paypalSubId: resource.id },
          data: { paypalStatus: "suspended", isActive: false },
        });
        if (client) {
          await createNotification({
            type: "payment_failed",
            title: `⚠️ Payment failed: ${client.businessName}`,
            message: `Payment failed for ${client.businessName}. Their account has been auto-suspended. They need to update their payment method.`,
            metadata: {
              Client: client.businessName,
              Email: client.user.email,
              "Subscription ID": resource.id,
            },
          });
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        const client = await prisma.client.findFirst({ where: { paypalSubId: resource.id }, include: { user: true } });
        await prisma.client.updateMany({
          where: { paypalSubId: resource.id },
          data: { paypalStatus: "cancelled", isActive: false },
        });
        if (client) {
          await createNotification({
            type: "subscription_cancelled",
            title: `Subscription cancelled: ${client.businessName}`,
            message: `${client.businessName} has cancelled their subscription. Their account has been deactivated.`,
            metadata: {
              Client: client.businessName,
              Email: client.user.email,
            },
          });
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.EXPIRED": {
        await prisma.client.updateMany({
          where: { paypalSubId: resource.id },
          data: { paypalStatus: "expired", isActive: false },
        });
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        const subId = resource.billing_agreement_id;
        if (subId) {
          await prisma.client.updateMany({
            where: { paypalSubId: subId },
            data: { paypalStatus: "active", isActive: true },
          });
        }
        break;
      }

      case "PAYMENT.SALE.DENIED":
      case "PAYMENT.SALE.REFUNDED": {
        const subId = resource.billing_agreement_id;
        if (subId) {
          await prisma.client.updateMany({
            where: { paypalSubId: subId },
            data: { paypalStatus: "suspended", isActive: false },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
