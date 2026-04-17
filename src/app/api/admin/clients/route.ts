import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { PLANS, generateWidgetId } from "@/lib/paypal";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { leads: true, conversations: true } },
    },
  });

  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password, businessName, plan } = body;

  if (!name || !email || !password || !businessName) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);
  const apiKey = `cai_${uuidv4().replace(/-/g, "")}`;
  const widgetId = generateWidgetId();
  const planKey = (plan || "starter") as keyof typeof PLANS;
  const monthlyLimit = PLANS[planKey]?.monthlyLimit || 1000;

  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      email,
      passwordHash,
      name,
      role: "client",
      client: {
        create: {
          id: uuidv4(),
          businessName,
          widgetId,
          apiKey,
          plan: planKey,
          monthlyLimit,
          isActive: true,
          paypalStatus: "active",
        },
      },
    },
    include: { client: true },
  });

  return NextResponse.json({
    id: user.client!.id,
    widgetId,
    apiKey,
    email: user.email,
    businessName,
  });
}
