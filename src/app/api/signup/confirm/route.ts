import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, subscriptionId, plan } = body;

    console.log("SUBSCRIPTION CONFIRMED:", { email, subscriptionId, plan });

    // Try to activate the client in the database
    try {
      const prisma = (await import("@/lib/db")).default;
      const user = await prisma.user.findUnique({
        where: { email },
        include: { client: true },
      });

      if (user?.client) {
        await prisma.client.update({
          where: { id: user.client.id },
          data: {
            isActive: true,
            paypalSubId: subscriptionId,
            paypalStatus: "active",
          },
        });
      }
    } catch {
      // Database not available — subscription still logged
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
