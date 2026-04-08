import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { PLANS } from "@/lib/paypal";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalClients, activeClients, totalLeads, totalConversations, recentClients] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { isActive: true } }),
    prisma.lead.count(),
    prisma.conversation.count(),
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { _count: { select: { leads: true } } },
    }),
  ]);

  // Calculate estimated monthly revenue from active clients
  const activeClientsList = await prisma.client.findMany({
    where: { isActive: true },
    select: { plan: true },
  });

  const monthlyRevenue = activeClientsList.reduce((sum, c) => {
    const planKey = c.plan as keyof typeof PLANS;
    return sum + (PLANS[planKey]?.price || 0);
  }, 0);

  return NextResponse.json({
    totalClients,
    activeClients,
    totalLeads,
    totalConversations,
    monthlyRevenue,
    recentClients: recentClients.map((c) => ({
      id: c.id,
      businessName: c.businessName,
      plan: c.plan,
      isActive: c.isActive,
      leadsCount: c._count.leads,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}
