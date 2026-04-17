import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    agentName: client.agentName,
    welcomeMessage: client.welcomeMessage,
    systemPrompt: client.systemPrompt,
    brandColor: client.brandColor,
    notifyEmail: client.notifyEmail,
    notifyOnLead: client.notifyOnLead,
    notifyPhone: client.notifyPhone,
    calendarLink: client.calendarLink,
    businessHours: client.businessHours,
    webhookUrl: client.webhookUrl,
    whiteLabel: client.whiteLabel,
    plan: client.plan,
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  const body = await req.json();

  // Validate field lengths
  if (body.systemPrompt && body.systemPrompt.length > 2000) {
    return NextResponse.json({ error: "Custom instructions too long (max 2000 characters)" }, { status: 400 });
  }
  if (body.welcomeMessage && body.welcomeMessage.length > 500) {
    return NextResponse.json({ error: "Welcome message too long (max 500 characters)" }, { status: 400 });
  }
  if (body.agentName && body.agentName.length > 50) {
    return NextResponse.json({ error: "Agent name too long (max 50 characters)" }, { status: 400 });
  }
  if (body.brandColor && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(body.brandColor)) {
    return NextResponse.json({ error: "Invalid brand color format (must be hex)" }, { status: 400 });
  }

  // Get current client to check plan for feature gating
  const currentClient = await prisma.client.findUnique({ where: { id: clientId }, select: { plan: true } });
  if (!currentClient) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const isPro = currentClient.plan === "professional" || currentClient.plan === "enterprise";
  const isEnterprise = currentClient.plan === "enterprise";

  // Build update data — only include fields that were sent
  const updateData: Record<string, unknown> = {};
  // All plans — basic settings
  if (body.agentName !== undefined) updateData.agentName = body.agentName;
  if (body.welcomeMessage !== undefined) updateData.welcomeMessage = body.welcomeMessage;
  if (body.systemPrompt !== undefined) updateData.systemPrompt = body.systemPrompt;
  if (body.brandColor !== undefined) updateData.brandColor = body.brandColor;
  if (body.notifyEmail !== undefined) updateData.notifyEmail = body.notifyEmail;
  if (body.notifyOnLead !== undefined) updateData.notifyOnLead = body.notifyOnLead;
  if (body.calendarLink !== undefined) updateData.calendarLink = body.calendarLink;
  if (body.businessHours !== undefined) updateData.businessHours = body.businessHours;
  // Pro+Enterprise only — CRM webhook, SMS
  if (body.notifyPhone !== undefined && isPro) updateData.notifyPhone = body.notifyPhone;
  if (body.webhookUrl !== undefined && isPro) updateData.webhookUrl = body.webhookUrl;
  // Enterprise only — white-label
  if (body.whiteLabel !== undefined && isEnterprise) updateData.whiteLabel = body.whiteLabel;

  await prisma.client.update({
    where: { id: clientId },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}
