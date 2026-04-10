import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const DEMO_API_KEY = "cai_44d60f6ac0e849d78060792f010730ed";
const DEMO_CONFIG = {
  agentName: "Sarah",
  businessName: "Sunshine Realty Group",
  welcomeMessage: "Hi there! I'm Sarah, your AI real estate assistant at Sunshine Realty.",
  systemPrompt: "",
  calendarLink: "",
  businessHours: "Monday-Friday 9am-6pm",
  properties: [
    { title: "Modern Downtown Condo", price: 485000, bedrooms: 2, bathrooms: 2, sqft: 1200, city: "Miami", propertyType: "condo", description: "Stunning 2-bedroom condo with panoramic city views, modern finishes, and rooftop pool access." },
    { title: "Family Home with Pool", price: 725000, bedrooms: 4, bathrooms: 3, sqft: 2800, city: "Coral Gables", propertyType: "house", description: "Spacious 4-bedroom family home with a heated pool, 2-car garage, and updated kitchen." },
    { title: "Luxury Waterfront Villa", price: 2150000, bedrooms: 5, bathrooms: 4, sqft: 4500, city: "Miami Beach", propertyType: "house", description: "Breathtaking 5-bedroom waterfront villa with private dock, infinity pool, and smart home features." },
    { title: "Beachfront Penthouse", price: 1485000, bedrooms: 3, bathrooms: 3, sqft: 2100, city: "South Beach", propertyType: "condo", description: "Luxury 3-bedroom penthouse with panoramic ocean views, private terrace, and 24/7 concierge service." },
    { title: "Charming Coconut Grove", price: 895000, bedrooms: 3, bathrooms: 2, sqft: 2200, city: "Coconut Grove", propertyType: "house", description: "Charming 3-bedroom home with tropical garden, mature trees, and walking distance to the marina." },
    { title: "Contemporary Brickell Loft", price: 625000, bedrooms: 2, bathrooms: 2, sqft: 1500, city: "Brickell", propertyType: "condo", description: "Modern 2-bedroom loft with floor-to-ceiling windows, building amenities, and valet parking." },
  ],
};

const demoConversations = new Map<string, Array<{ role: string; content: string }>>();

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey: key });
}

function buildSystemPrompt(config: any, msgCount: number) {
  const propertyContext = config.properties.length > 0
    ? config.properties.map((p: any, i: number) => `${i + 1}. "${p.title}" — $${p.price.toLocaleString()} | ${p.bedrooms}bd/${p.bathrooms}ba | ${p.sqft.toLocaleString()} sqft | ${p.city} | ${p.propertyType} | ${p.description}`).join("\n")
    : "No specific properties listed yet. Focus on understanding their needs and offering to show matching properties.";

  let stageHint = "";
  if (msgCount === 0) stageHint = "\nSTAGE: Opening — warmly greet and ask one open-ended question about what they're looking for.";
  else if (msgCount <= 4) stageHint = "\nSTAGE: Discovery — learn their needs (location, budget, timeline, property type). Get their first name.";
  else if (msgCount <= 8) stageHint = "\nSTAGE: Qualification — get email or phone. Recommend 1-2 matching properties (never more). Ask about financing readiness.";
  else stageHint = "\nSTAGE: Closing — push for a callback/viewing appointment. If you have calendar link, share it. Ask for phone if not yet captured.";

  const bookingInfo = config.calendarLink
    ? `\n\nBOOKING: When the visitor is ready to schedule, share this calendar link: ${config.calendarLink}`
    : `\n\nBOOKING: Ask for their phone number to have an agent call them to schedule.`;

  return `You are ${config.agentName}, a top-performing AI real estate assistant for ${config.businessName}. You are warm, knowledgeable, genuinely helpful, and naturally persuasive.

LANGUAGE RULE (CRITICAL):
- ALWAYS detect the visitor's language and respond in the SAME language
- You speak ALL languages fluently — English, Spanish, Arabic, French, Portuguese, Chinese, Hindi, German, Italian, Russian, Japanese, Korean, Turkish, etc.
- Switch languages if they switch

YOUR MISSION (in priority order):
1. BUILD RAPPORT — Make visitors feel heard and valued
2. UNDERSTAND NEEDS — Buying, selling, renting? Budget? Location? Timeline? Financing?
3. CAPTURE CONTACT INFO — Get name first, then email, then phone
4. MATCH PROPERTIES — Recommend 1-2 specific listings (NEVER more, causes decision paralysis)
5. QUALIFY LEAD — Timeline (immediate/1-3mo/3-6mo/6+mo), pre-approval status
6. DRIVE ACTION — Book appointment or get callback scheduled

WHEN YOU CAPTURE INFORMATION, add these hidden tags at the END of your response:
[LEAD_NAME: name]
[LEAD_EMAIL: email]
[LEAD_PHONE: phone]
[LEAD_BUDGET: budget range]
[LEAD_LOCATION: preferred area]
[LEAD_TYPE: property type they want]
[LEAD_TIMELINE: immediate|1-3 months|3-6 months|6+ months]
[LEAD_PREAPPROVED: yes|no|unknown]

LEAD SCORING (include at end when you have enough info):
[LEAD_SCORE: 1-10]
[LEAD_TEMP: hot|warm|cold]
[LEAD_REASON: brief reason for the score]

SCORING RULES:
- HOT (8-10): Pre-approved, moving in <60 days, specific requirements, ready to book viewing
- WARM (4-7): Researching seriously, 3-6 month timeline, budget clear
- COLD (1-3): Just browsing, no timeline, vague interest

RESPONSE STYLE:
- Keep responses 2-4 sentences (chat, not essay)
- Use their name once you know it
- Ask ONE question at a time
- Show enthusiasm and create gentle urgency
- Never recommend more than 2 properties at once
- If they seem hot, push for immediate action (call/viewing)

HANDLING SCENARIOS:
- Asking about mortgage: Say you can connect them with the agent for financing details
- Wants to sell: Express interest, ask about their property, offer free valuation
- Off-topic: Acknowledge briefly, redirect to real estate
- Frustrated: Apologize, offer to connect them with a human
- Just browsing: "That's fine! What area or type catches your eye?"

BUSINESS HOURS: ${config.businessHours}${bookingInfo}

${config.systemPrompt ? `\nADDITIONAL INSTRUCTIONS:\n${config.systemPrompt}` : ""}

AVAILABLE PROPERTIES:
${propertyContext}
${stageHint}`;
}

function extractAllInfo(text: string) {
  const extract = (tag: string) => {
    const match = text.match(new RegExp(`\\[${tag}:\\s*(.+?)\\]`));
    return match ? match[1].trim() : null;
  };
  return {
    name: extract("LEAD_NAME"),
    email: extract("LEAD_EMAIL"),
    phone: extract("LEAD_PHONE"),
    budget: extract("LEAD_BUDGET"),
    location: extract("LEAD_LOCATION"),
    propertyType: extract("LEAD_TYPE"),
    timeline: extract("LEAD_TIMELINE"),
    preApproved: extract("LEAD_PREAPPROVED"),
    score: extract("LEAD_SCORE"),
    temperature: extract("LEAD_TEMP"),
    scoreReason: extract("LEAD_REASON"),
  };
}

function cleanResponse(text: string): string {
  return text.replace(/\[LEAD_\w+:\s*.+?\]/g, "").replace(/\s{2,}/g, " ").trim();
}

async function sendLeadNotification(clientId: string, lead: any) {
  // Try to send email notification to client
  try {
    const prisma = (await import("@/lib/db")).default;
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client || !client.notifyOnLead || !client.notifyEmail) return;

    const emailApiKey = process.env.RESEND_API_KEY;
    if (!emailApiKey) {
      console.log("NEW LEAD NOTIFICATION (email service not configured):", lead);
      return;
    }

    const tempEmoji = lead.temperature === "hot" ? "HOT" : lead.temperature === "warm" ? "WARM" : "COLD";
    const html = `
<h2>New Lead Captured! ${tempEmoji}</h2>
<p>Your CloserAI chatbot just captured a new lead:</p>
<table style="border-collapse:collapse;width:100%;max-width:500px">
  <tr><td><strong>Name:</strong></td><td>${lead.name || "Not provided"}</td></tr>
  <tr><td><strong>Email:</strong></td><td>${lead.email || "Not provided"}</td></tr>
  <tr><td><strong>Phone:</strong></td><td>${lead.phone || "Not provided"}</td></tr>
  <tr><td><strong>Budget:</strong></td><td>${lead.budget || "Not specified"}</td></tr>
  <tr><td><strong>Location:</strong></td><td>${lead.location || "Not specified"}</td></tr>
  <tr><td><strong>Property Type:</strong></td><td>${lead.propertyType || "Not specified"}</td></tr>
  <tr><td><strong>Timeline:</strong></td><td>${lead.timeline || "Unknown"}</td></tr>
  <tr><td><strong>Pre-Approved:</strong></td><td>${lead.preApproved || "Unknown"}</td></tr>
  <tr><td><strong>Lead Score:</strong></td><td>${lead.score || "N/A"}/10 (${lead.temperature || "unknown"})</td></tr>
  <tr><td><strong>Why:</strong></td><td>${lead.scoreReason || ""}</td></tr>
</table>
<p><strong>Action Required:</strong> ${lead.temperature === "hot" ? "Call this lead within 5 minutes!" : lead.temperature === "warm" ? "Follow up within 24 hours." : "Add to nurture sequence."}</p>
<p>View full conversation in your <a href="https://closerai-app.vercel.app/dashboard">CloserAI Dashboard</a>.</p>
`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${emailApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "CloserAI <leads@closerai-app.vercel.app>",
        to: client.notifyEmail,
        subject: `${tempEmoji} New ${lead.temperature || ""} lead: ${lead.name || "Website Visitor"}`,
        html,
      }),
    });
  } catch (e) {
    console.error("Failed to send lead notification:", e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, conversationId, message } = body;

    if (!apiKey || !message) {
      return NextResponse.json({ error: "Missing apiKey or message" }, { status: 400 });
    }

    let config: any = DEMO_CONFIG;
    let isDemoMode = true;
    let clientId: string | null = null;

    try {
      const prisma = (await import("@/lib/db")).default;
      const { checkTrialStatus } = await import("@/lib/trial");
      const client = await prisma.client.findUnique({
        where: { apiKey },
        include: { properties: { where: { status: "active" } } },
      });

      if (!client && apiKey !== DEMO_API_KEY) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }

      if (client) {
        // Check trial expiry first — auto-deactivate if expired
        const trialStatus = await checkTrialStatus(client.id);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://closerai-app.vercel.app";

        if (trialStatus.expired) {
          return NextResponse.json({
            error: "Trial expired. Please subscribe to continue.",
            trialExpired: true,
            subscribeUrl: `${appUrl}/trial-expired`
          }, { status: 403 });
        }

        if (!trialStatus.isActive) {
          return NextResponse.json({ error: "Account deactivated. Please contact support." }, { status: 403 });
        }

        // CRITICAL: Enforce monthly usage limit
        // Reset counter if we're in a new billing month
        const now = new Date();
        const resetDate = new Date(client.usageResetDate);
        const daysSinceReset = Math.floor((now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceReset >= 30) {
          // Reset monthly counter
          await prisma.client.update({
            where: { id: client.id },
            data: { usageThisMonth: 0, usageResetDate: now },
          });
          client.usageThisMonth = 0;
        }

        if (client.usageThisMonth >= client.monthlyLimit) {
          return NextResponse.json({
            error: "Monthly conversation limit reached. Please upgrade your plan.",
            limitReached: true,
            upgradeUrl: `${appUrl}/pricing`
          }, { status: 429 });
        }

        // Increment usage counter (async, don't await)
        prisma.client.update({
          where: { id: client.id },
          data: { usageThisMonth: { increment: 1 } },
        }).catch(() => {});

        clientId = client.id;
        config = {
          agentName: client.agentName,
          businessName: client.businessName,
          welcomeMessage: client.welcomeMessage,
          systemPrompt: client.systemPrompt,
          calendarLink: client.calendarLink,
          businessHours: client.businessHours,
          properties: client.properties,
        };
        isDemoMode = false;
      }
    } catch {
      if (apiKey !== DEMO_API_KEY) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }
    }

    let convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let history = demoConversations.get(convId) || [];
    history.push({ role: "user", content: message });

    const claudeMessages = history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    const systemPrompt = buildSystemPrompt(config, history.length);

    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const aiText = response.content[0].type === "text" ? response.content[0].text : "";
    const cleanedResponse = cleanResponse(aiText);

    history.push({ role: "assistant", content: cleanedResponse });
    demoConversations.set(convId, history);

    // Save to database if not demo mode
    if (!isDemoMode && clientId) {
      try {
        const prisma = (await import("@/lib/db")).default;
        const { v4: uuidv4 } = await import("uuid");

        let dbConvId = conversationId;
        if (!dbConvId) {
          const conv = await prisma.conversation.create({
            data: { id: uuidv4(), clientId, visitorName: "Website Visitor" },
          });
          dbConvId = conv.id;
        }

        await prisma.message.create({ data: { id: uuidv4(), conversationId: dbConvId, role: "user", content: message } });
        await prisma.message.create({ data: { id: uuidv4(), conversationId: dbConvId, role: "assistant", content: cleanedResponse } });

        const info = extractAllInfo(aiText);
        const hasLeadInfo = info.name || info.email || info.phone;

        if (hasLeadInfo) {
          const existingLead = await prisma.lead.findFirst({
            where: { clientId, conversations: { some: { id: dbConvId } } },
          });

          const leadData = {
            name: info.name || existingLead?.name || "",
            email: info.email || existingLead?.email || "",
            phone: info.phone || existingLead?.phone || "",
            budget: info.budget || existingLead?.budget || "",
            location: info.location || existingLead?.location || "",
            propertyType: info.propertyType || existingLead?.propertyType || "",
            timeline: info.timeline || existingLead?.timeline || "",
            preApproved: info.preApproved === "yes" || (existingLead?.preApproved ?? false),
            score: info.score ? parseInt(info.score) : (existingLead?.score || 0),
            temperature: info.temperature || existingLead?.temperature || "cold",
            scoreReason: info.scoreReason || existingLead?.scoreReason || "",
          };

          let lead;
          if (existingLead) {
            lead = await prisma.lead.update({ where: { id: existingLead.id }, data: leadData });
          } else {
            lead = await prisma.lead.create({ data: { id: uuidv4(), clientId, ...leadData } });
            await prisma.conversation.update({ where: { id: dbConvId }, data: { leadId: lead.id, visitorName: info.name || "Website Visitor" } });
            // Send notification for new hot/warm leads
            if (info.temperature === "hot" || info.temperature === "warm") {
              await sendLeadNotification(clientId, lead);
            }
          }
        }

        convId = dbConvId;
      } catch (e) {
        console.error("DB save error:", e);
      }
    }

    return NextResponse.json(
      { conversationId: convId, message: cleanedResponse },
      { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }
    );
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
