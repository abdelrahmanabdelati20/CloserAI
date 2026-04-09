import prisma from "./db";

/**
 * Check if a trial has expired and auto-deactivate if so.
 * Returns { isActive, expired, daysLeft } for the client.
 */
export async function checkTrialStatus(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      isActive: true,
      paypalStatus: true,
      trialEndsAt: true,
    },
  });

  if (!client) {
    return { exists: false, isActive: false, expired: false, daysLeft: 0 };
  }

  // Not a trial — return current status
  if (!client.trialEndsAt || client.paypalStatus !== "trial") {
    return {
      exists: true,
      isActive: client.isActive,
      expired: false,
      daysLeft: 0,
      isTrial: false,
    };
  }

  const now = new Date();
  const endsAt = new Date(client.trialEndsAt);
  const msLeft = endsAt.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  // Trial expired — auto-deactivate
  if (msLeft <= 0) {
    if (client.isActive) {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          isActive: false,
          paypalStatus: "expired_trial",
        },
      });
    }
    return {
      exists: true,
      isActive: false,
      expired: true,
      daysLeft: 0,
      isTrial: true,
    };
  }

  // Trial still active
  return {
    exists: true,
    isActive: client.isActive,
    expired: false,
    daysLeft,
    isTrial: true,
  };
}

/**
 * Check trial by API key (for widget/chat usage)
 */
export async function checkTrialByApiKey(apiKey: string) {
  const client = await prisma.client.findUnique({
    where: { apiKey },
    select: { id: true },
  });
  if (!client) return null;
  return checkTrialStatus(client.id);
}
