import prisma from "./db";

export type NotificationType =
  | "trial_signup"
  | "new_payment"
  | "payment_failed"
  | "trial_expired"
  | "new_lead"
  | "subscription_cancelled";

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Create an admin notification (shows in admin panel + optionally sends email)
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    // Save to database
    await prisma.notification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        metadata: params.metadata ? JSON.stringify(params.metadata) : "",
      },
    });

    // Also send email notification if Resend is configured
    await sendEmailNotification(params);

    console.log(`[NOTIFICATION] ${params.type}: ${params.title}`);
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

async function sendEmailNotification(params: CreateNotificationParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL || "abdelrahmanabdelati20@gmail.com";

  if (!apiKey) {
    // Resend not configured — notification is still saved in DB
    return;
  }

  const emoji: Record<string, string> = {
    trial_signup: "🎯",
    new_payment: "💰",
    payment_failed: "⚠️",
    trial_expired: "⏰",
    new_lead: "👤",
    subscription_cancelled: "👋",
  };

  const metadataHtml = params.metadata
    ? Object.entries(params.metadata)
        .map(([key, value]) => `<tr><td style="padding:4px 8px;font-weight:bold;">${key}:</td><td style="padding:4px 8px;">${value}</td></tr>`)
        .join("")
    : "";

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%);color:white;padding:20px;border-radius:12px 12px 0 0;">
    <div style="font-size:32px;margin-bottom:8px;">${emoji[params.type] || "🔔"}</div>
    <h1 style="margin:0;font-size:22px;">${params.title}</h1>
  </div>
  <div style="background:white;padding:25px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;">
    <p style="font-size:16px;color:#374151;line-height:1.6;">${params.message}</p>
    ${metadataHtml ? `<table style="width:100%;margin-top:20px;background:#f9fafb;border-radius:8px;padding:10px;">${metadataHtml}</table>` : ""}
    <div style="margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;">
      <a href="https://closerai-app.vercel.app/admin" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Open Admin Dashboard</a>
    </div>
  </div>
  <div style="text-align:center;margin-top:15px;color:#9ca3af;font-size:12px;">
    CloserAI Notification · <a href="https://closerai-app.vercel.app" style="color:#2563eb;">closerai-app.vercel.app</a>
  </div>
</body>
</html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CloserAI Alerts <alerts@closerai-app.vercel.app>",
        to: ownerEmail,
        subject: `${emoji[params.type] || "🔔"} ${params.title}`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend email error:", error);
    }
  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
}
