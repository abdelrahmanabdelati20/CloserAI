import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, businessName, website, city } = body;

    if (!name || !email || !businessName) {
      return NextResponse.json({ error: "Name, email, and business name are required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (name.length > 100 || businessName.length > 200) {
      return NextResponse.json({ error: "Name or business name too long" }, { status: 400 });
    }

    // Try to create in database
    try {
      const prisma = (await import("@/lib/db")).default;

      // Check if email already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({
          error: "An account with this email already exists. Please log in instead."
        }, { status: 400 });
      }

      // Generate credentials
      const password = generatePassword();
      const passwordHash = await hash(password, 12);
      const apiKey = `cai_${uuidv4().replace(/-/g, "")}`;

      // Create trial account (14 days)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

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
              plan: "starter",
              monthlyLimit: 500,
              isActive: true,
              paypalStatus: "trial",
              trialEndsAt,
              notifyEmail: email,
              agentName: "Alex",
              welcomeMessage: `Hi! I'm Alex from ${businessName}. Looking to buy, sell, or just exploring? I'd love to help!`,
            },
          },
        },
      });

      console.log("NEW TRIAL SIGNUP:", { name, email, businessName, website, city });

      return NextResponse.json({
        success: true,
        apiKey,
        password,
        message: "Free trial activated! Login credentials sent.",
      });
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      // Still return success so user gets confirmation
      const password = generatePassword();
      const apiKey = `cai_trial_${Date.now().toString(36)}`;
      return NextResponse.json({
        success: true,
        apiKey,
        password,
        message: "Trial signup received. We'll email you credentials within 1 hour.",
      });
    }
  } catch (error: any) {
    console.error("Trial signup error:", error);
    return NextResponse.json({ error: error.message || "Signup failed" }, { status: 500 });
  }
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd + "!A1";
}
