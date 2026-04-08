import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  // Verify the lead belongs to this client
  const lead = await prisma.lead.findFirst({
    where: { id: params.id, clientId },
  });

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.lead.update({
    where: { id: params.id },
    data: {
      status: body.status || lead.status,
      notes: body.notes ?? lead.notes,
    },
  });

  return NextResponse.json(updated);
}
