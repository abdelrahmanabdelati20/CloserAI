import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// PayPal sends webhook notifications for subscription events
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = body.event_type;
    const resource = body.resource;

    console.log("PayPal Webhook:", eventType);

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subId = resource.id;
        await prisma.client.updateMany({
          where: { paypalSubId: subId },
          data: { paypalStatus: "active", isActive: true },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const subId = resource.id;
        await prisma.client.updateMany({
          where: { paypalSubId: subId },
          data: { paypalStatus: "suspended", isActive: false },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        const subId = resource.id;
        await prisma.client.updateMany({
          where: { paypalSubId: subId },
          data: { paypalStatus: "cancelled", isActive: false },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const subId = resource.id;
        await prisma.client.updateMany({
          where: { paypalSubId: subId },
          data: { paypalStatus: "expired", isActive: false },
        });
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        // Successful payment — ensure client stays active
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
            data: { paypalStatus: "suspended" },
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
