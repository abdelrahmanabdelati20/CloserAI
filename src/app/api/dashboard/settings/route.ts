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
    calendarLink: client.calendarLink,
    businessHours: client.businessHours,
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

  await prisma.client.update({
    where: { id: clientId },
    data: {
      agentName: body.agentName,
      welcomeMessage: body.welcomeMessage,
      systemPrompt: body.systemPrompt,
      brandColor: body.brandColor,
      notifyEmail: body.notifyEmail,
      notifyOnLead: body.notifyOnLead,
      calendarLink: body.calendarLink,
      businessHours: body.businessHours,
    },
  });

  return NextResponse.json({ success: true });
}
