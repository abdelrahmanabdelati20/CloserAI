import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { hash } from "bcryptjs";
import { PLANS } from "@/lib/paypal";

// UPDATE client - change anything
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Update client fields
  const updateData: any = {};
  if (body.businessName) updateData.businessName = body.businessName;
  if (body.plan) {
    updateData.plan = body.plan;
    const planKey = body.plan as keyof typeof PLANS;
    if (PLANS[planKey]) {
      updateData.monthlyLimit = PLANS[planKey].monthlyLimit;
    }
  }
  if (body.monthlyLimit !== undefined) updateData.monthlyLimit = body.monthlyLimit;
  if (body.agentName !== undefined) updateData.agentName = body.agentName;
  if (body.welcomeMessage !== undefined) updateData.welcomeMessage = body.welcomeMessage;
  if (body.systemPrompt !== undefined) updateData.systemPrompt = body.systemPrompt;
  if (body.brandColor !== undefined) updateData.brandColor = body.brandColor;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.website !== undefined) updateData.website = body.website;

  const client = await prisma.client.update({
    where: { id: params.id },
    data: updateData,
  });

  // Reset password if provided
  if (body.newPassword && body.newPassword.length > 0) {
    const passwordHash = await hash(body.newPassword, 12);
    await prisma.user.update({
      where: { id: client.userId },
      data: { passwordHash },
    });
  }

  return NextResponse.json({ success: true });
}

// DELETE client - remove completely
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Delete user cascades to client, leads, conversations, messages, properties
  await prisma.user.delete({ where: { id: client.userId } });

  return NextResponse.json({ success: true });
}
