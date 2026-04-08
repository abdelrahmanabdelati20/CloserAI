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
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  const body = await req.json();

  const updated = await prisma.client.update({
    where: { id: clientId },
    data: {
      agentName: body.agentName,
      welcomeMessage: body.welcomeMessage,
      systemPrompt: body.systemPrompt,
      brandColor: body.brandColor,
    },
  });

  return NextResponse.json({ success: true });
}
