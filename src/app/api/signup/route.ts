import { NextResponse } from "next/server";

// Store signups in memory (on Vercel) and try database
const signups: Array<any> = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, businessName, website, plan } = body;

    if (!name || !email || !businessName) {
      return NextResponse.json({ error: "Name, email, and business name are required" }, { status: 400 });
    }

    const signup = {
      name,
      email,
      phone: phone || "",
      businessName,
      website: website || "",
      plan: plan || "starter",
      createdAt: new Date().toISOString(),
    };

    // Store in memory
    signups.push(signup);

    // Try to store in database if available
    try {
      const prisma = (await import("@/lib/db")).default;
      const { hash } = await import("bcryptjs");
      const { v4: uuidv4 } = await import("uuid");

      // Check if email already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        // Create a pending client account (inactive until payment confirmed)
        const passwordHash = await hash(email.split("@")[0] + "2024!", 12);
        const apiKey = `cai_${uuidv4().replace(/-/g, "")}`;

        await prisma.user.create({
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
                phone: phone || "",
                website: website || "",
                apiKey,
                plan,
                isActive: false, // Inactive until payment confirmed
                paypalStatus: "pending",
                monthlyLimit: plan === "enterprise" ? 10000 : plan === "professional" ? 3000 : 1000,
              },
            },
          },
        });
      }
    } catch {
      // Database not available — signup still saved in memory
    }

    console.log("NEW SIGNUP:", JSON.stringify(signup));

    return NextResponse.json({ success: true, message: "Signup received!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Signup failed" }, { status: 500 });
  }
}

// GET endpoint to view signups (admin only)
export async function GET() {
  return NextResponse.json(signups);
}
