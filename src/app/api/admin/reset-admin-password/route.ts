// Admin password reset endpoint — protected by CRON_SECRET so only the
// project owner with shell access can use it. Lets us forcibly resync the
// admin user's stored bcrypt hash with the current ADMIN_PASSWORD env var,
// or set an entirely new password from a curl one-liner.
//
// Usage:
//   curl -X POST https://closerai.org/api/admin/reset-admin-password \
//        -H "Authorization: Bearer $CRON_SECRET" \
//        -H "Content-Type: application/json" \
//        -d '{"newPassword":"YourNewPasswordHere"}'
//
// If newPassword is omitted the endpoint syncs the admin user's hash to the
// current ADMIN_PASSWORD env value — useful when you've rotated the env var
// and want the DB to match without dropping the row.

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET || "";
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}

  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  if (!adminEmail) {
    return NextResponse.json({ error: "ADMIN_EMAIL env var not configured" }, { status: 500 });
  }

  const newPassword = String(body.newPassword || process.env.ADMIN_PASSWORD || "").trim();
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password missing or shorter than 8 chars (set ADMIN_PASSWORD env or pass newPassword in body)" },
      { status: 400 }
    );
  }

  const passwordHash = await hash(newPassword, 12);

  // Upsert the admin user so this works whether the row exists or not.
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "admin" },
    create: {
      id: uuidv4(),
      email: adminEmail,
      passwordHash,
      name: "Admin",
      role: "admin",
    },
    select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({
    ok: true,
    message: "Admin password updated. Sign in at https://closerai.org/login.",
    admin: user,
    // Don't return the password itself — the caller already knows it.
  });
}

// Allow GET as a no-op so accidentally hitting the URL in a browser doesn't
// look like a 404.
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "POST with Authorization: Bearer $CRON_SECRET to reset the admin password.",
  });
}
