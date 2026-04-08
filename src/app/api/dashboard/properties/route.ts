import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  const properties = await prisma.property.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(properties);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  const body = await req.json();

  const property = await prisma.property.create({
    data: {
      id: uuidv4(),
      clientId,
      title: body.title,
      description: body.description || "",
      price: body.price || 0,
      address: body.address || "",
      city: body.city || "",
      bedrooms: body.bedrooms || 0,
      bathrooms: body.bathrooms || 0,
      sqft: body.sqft || 0,
      propertyType: body.propertyType || "house",
    },
  });

  return NextResponse.json(property);
}
