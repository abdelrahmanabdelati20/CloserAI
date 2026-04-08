import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const apiKey = url.searchParams.get("key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({
    where: { apiKey },
    select: {
      agentName: true,
      welcomeMessage: true,
      brandColor: true,
      businessName: true,
      isActive: true,
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  if (!client.isActive) {
    return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
  }

  // Return config with CORS headers
  return NextResponse.json({
    agentName: client.agentName,
    welcomeMessage: client.welcomeMessage,
    brandColor: client.brandColor,
    businessName: client.businessName,
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
