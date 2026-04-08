import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  const conversations = await prisma.conversation.findMany({
    where: { clientId },
    orderBy: { updatedAt: "desc" },
    include: {
      lead: { select: { name: true, email: true } },
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(conversations);
}
