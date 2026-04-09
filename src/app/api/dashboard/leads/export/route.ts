import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  const leads = await prisma.lead.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV
  const headers = ["Date", "Name", "Email", "Phone", "Status", "Score", "Temperature", "Budget", "Location", "Property Type", "Timeline", "Pre-Approved", "Score Reason", "Notes"];
  const rows = leads.map((l) => [
    l.createdAt.toISOString().split("T")[0],
    l.name,
    l.email,
    l.phone,
    l.status,
    l.score.toString(),
    l.temperature,
    l.budget,
    l.location,
    l.propertyType,
    l.timeline,
    l.preApproved ? "Yes" : "No",
    l.scoreReason,
    l.notes,
  ]);

  const csvLines = [headers, ...rows].map((row) =>
    row.map((val) => {
      const str = String(val || "");
      // Escape quotes and wrap in quotes if contains comma/quote/newline
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(",")
  );

  const csv = csvLines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
