import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  const [client, leadsCount, conversationsCount, recentLeads] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.lead.count({ where: { clientId } }),
    prisma.conversation.count({ where: { clientId } }),
    prisma.lead.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  return NextResponse.json({
    client: {
      businessName: client.businessName,
      apiKey: client.apiKey,
      plan: client.plan,
      isActive: client.isActive,
      usageThisMonth: client.usageThisMonth,
      monthlyLimit: client.monthlyLimit,
      agentName: client.agentName,
      welcomeMessage: client.welcomeMessage,
      brandColor: client.brandColor,
    },
    leadsCount,
    conversationsCount,
    recentLeads,
  });
}
