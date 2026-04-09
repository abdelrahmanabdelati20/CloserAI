import { NextResponse } from "next/server";

const DEMO_API_KEY = "cai_44d60f6ac0e849d78060792f010730ed";
const DEMO_CONFIG = {
  agentName: "Sarah",
  welcomeMessage: "Hi there! I'm Sarah, your AI real estate assistant at Sunshine Realty. Whether you're looking to buy, sell, or just exploring — I'm here to help! What are you looking for?",
  brandColor: "#2563eb",
  businessName: "Sunshine Realty Group",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const apiKey = url.searchParams.get("key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }

  // Try database first, fall back to demo
  try {
    const prisma = (await import("@/lib/db")).default;
    const { checkTrialStatus } = await import("@/lib/trial");
    const client = await prisma.client.findUnique({
      where: { apiKey },
      select: {
        id: true,
        agentName: true,
        welcomeMessage: true,
        brandColor: true,
        businessName: true,
        isActive: true
      },
    });

    if (client) {
      // Check trial expiry
      const trialStatus = await checkTrialStatus(client.id);

      if (trialStatus.expired) {
        return NextResponse.json({ error: "Trial expired" }, { status: 403 });
      }
      if (!trialStatus.isActive) {
        return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
      }

      return NextResponse.json({
        agentName: client.agentName,
        welcomeMessage: client.welcomeMessage,
        brandColor: client.brandColor,
        businessName: client.businessName,
      }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }
  } catch {
    // Database unavailable — use demo mode
  }

  // Demo mode fallback
  if (apiKey === DEMO_API_KEY) {
    return NextResponse.json(DEMO_CONFIG, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
}
