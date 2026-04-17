import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  const [
    client,
    leadsCount,
    conversationsCount,
    recentLeads,
    hotLeads,
    warmLeads,
    coldLeads,
    convertedLeads,
    last7daysLeads,
    last30daysLeads,
  ] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.lead.count({ where: { clientId } }),
    prisma.conversation.count({ where: { clientId } }),
    prisma.lead.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.lead.count({ where: { clientId, temperature: "hot" } }),
    prisma.lead.count({ where: { clientId, temperature: "warm" } }),
    prisma.lead.count({ where: { clientId, temperature: "cold" } }),
    prisma.lead.count({ where: { clientId, status: "converted" } }),
    prisma.lead.count({
      where: { clientId, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    }),
    prisma.lead.count({
      where: { clientId, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
    }),
  ]);

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  // Conversion rate
  const conversionRate = leadsCount > 0 ? Math.round((convertedLeads / leadsCount) * 100) : 0;

  return NextResponse.json({
    client: {
      businessName: client.businessName,
      widgetId: client.widgetId,
      apiKey: client.apiKey,
      plan: client.plan,
      isActive: client.isActive,
      usageThisMonth: client.usageThisMonth,
      monthlyLimit: client.monthlyLimit,
      agentName: client.agentName,
      welcomeMessage: client.welcomeMessage,
      brandColor: client.brandColor,
      paypalStatus: client.paypalStatus,
    },
    leadsCount,
    conversationsCount,
    recentLeads,
    analytics: {
      hotLeads,
      warmLeads,
      coldLeads,
      convertedLeads,
      conversionRate,
      last7daysLeads,
      last30daysLeads,
    },
  });
}
