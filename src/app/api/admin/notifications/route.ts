import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { read: false },
  });

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      ...n,
      metadata: n.metadata ? JSON.parse(n.metadata) : {},
    })),
    unreadCount,
  });
}

// Mark all as read
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
