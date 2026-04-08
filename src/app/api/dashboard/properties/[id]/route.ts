import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  const property = await prisma.property.findFirst({
    where: { id: params.id, clientId },
  });

  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.property.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
