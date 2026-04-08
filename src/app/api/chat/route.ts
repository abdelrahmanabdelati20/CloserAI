import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Demo config — used when database is unavailable (e.g., Vercel serverless)
const DEMO_API_KEY = "cai_44d60f6ac0e849d78060792f010730ed";
const DEMO_CONFIG = {
  agentName: "Sarah",
  businessName: "Sunshine Realty Group",
  welcomeMessage: "Hi there! I'm Sarah, your AI real estate assistant at Sunshine Realty.",
  systemPrompt: "",
  properties: [
    { title: "Modern Downtown Condo", price: 485000, bedrooms: 2, bathrooms: 2, sqft: 1200, city: "Miami", propertyType: "condo", description: "Stunning 2-bedroom condo with panoramic city views, modern finishes, and rooftop pool access." },
    { title: "Family Home with Pool", price: 725000, bedrooms: 4, bathrooms: 3, sqft: 2800, city: "Miami", propertyType: "house", description: "Spacious 4-bedroom family home with a heated pool, 2-car garage, and updated kitchen." },
    { title: "Luxury Waterfront Villa", price: 2150000, bedrooms: 5, bathrooms: 4, sqft: 4500, city: "Miami Beach", propertyType: "house", description: "Breathtaking 5-bedroom waterfront villa with private dock, infinity pool, and smart home features." },
  ],
};

// In-memory conversation store for demo mode
const demoConversations = new Map<string, Array<{ role: string; content: string }>>();

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey: key });
}

function buildSystemPrompt(config: typeof DEMO_CONFIG, msgCount: number) {
  const propertyContext = config.properties
    .map((p, i) => `${i + 1}. "${p.title}" — $${p.price.toLocaleString()} | ${p.bedrooms}bd/${p.bathrooms}ba | ${p.sqft.toLocaleString()} sqft | ${p.city} | ${p.propertyType} | ${p.description}`)
    .join("\n");

  let stageHint = "";
  if (msgCount === 0) stageHint = "\nSTAGE: Opening — warmly greet and ask one open-ended question.";
  else if (msgCount <= 4) stageHint = "\nSTAGE: Discovery — learn needs. Ask about location, budget, timeline. Get their name.";
  else if (msgCount <= 8) stageHint = "\nSTAGE: Qualification — get email or phone. Match with properties. Build excitement.";
  else stageHint = "\nSTAGE: Closing — push for a callback or viewing. Get phone/email if you don't have it.";

  return `You are ${config.agentName}, a top-performing AI real estate assistant for ${config.businessName}. You are warm, knowledgeable, genuinely helpful, and naturally persuasive.

YOUR MISSION:
1. BUILD RAPPORT — Make visitors feel heard and valued
2. UNDERSTAND NEEDS — Buying, selling, renting? Budget? Location? Timeline?
3. CAPTURE CONTACT INFO — Get name first, then email or phone naturally
4. MATCH PROPERTIES — Recommend specific listings that fit
5. DRIVE ACTION — Encourage scheduling a viewing or phone call

RESPONSE STYLE:
- 2-4 sentences max (chat, not essay)
- Use their name once you know it
- Ask ONE question at a time
- Be conversational, not corporate
- Create gentle urgency when appropriate
- Show genuine enthusiasm

AVAILABLE PROPERTIES:
${propertyContext}
${stageHint}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, conversationId, message } = body;

    if (!apiKey || !message) {
      return NextResponse.json({ error: "Missing apiKey or message" }, { status: 400 });
    }

    // Try database first, fall back to demo mode
    let config = DEMO_CONFIG;
    let isDemoMode = true;

    try {
      const prisma = (await import("@/lib/db")).default;
      const client = await prisma.client.findUnique({
        where: { apiKey },
        include: { properties: { where: { status: "active" } } },
      });
      if (client && client.isActive) {
        config = {
          agentName: client.agentName,
          businessName: client.businessName,
          welcomeMessage: client.welcomeMessage,
          systemPrompt: client.systemPrompt,
          properties: client.properties.map((p) => ({
            title: p.title,
            price: p.price,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            sqft: p.sqft,
            city: p.city,
            propertyType: p.propertyType,
            description: p.description,
          })),
        };
        isDemoMode = false;
      }
    } catch {
      // Database unavailable (Vercel serverless) — use demo mode
      if (apiKey !== DEMO_API_KEY) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }
    }

    // Get or create conversation
    let convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Get conversation history
    let history = demoConversations.get(convId) || [];

    // Add user message to history
    history.push({ role: "user", content: message });

    // Build messages for Claude
    const claudeMessages = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const systemPrompt = buildSystemPrompt(config, history.length);

    // Call Claude
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const aiText = response.content[0].type === "text" ? response.content[0].text : "";

    // Clean any lead tags from response
    const cleanedResponse = aiText
      .replace(/\[LEAD_\w+:\s*.+?\]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    // Save to history
    history.push({ role: "assistant", content: cleanedResponse });
    demoConversations.set(convId, history);

    // If not demo mode, save to database
    if (!isDemoMode) {
      try {
        const prisma = (await import("@/lib/db")).default;
        const { v4: uuidv4 } = await import("uuid");
        const { extractLeadInfo } = await import("@/lib/ai");

        let dbConvId = conversationId;
        if (!dbConvId) {
          const conv = await prisma.conversation.create({
            data: { id: uuidv4(), clientId: (await prisma.client.findUnique({ where: { apiKey } }))!.id, visitorName: "Website Visitor" },
          });
          dbConvId = conv.id;
        }

        await prisma.message.create({ data: { id: uuidv4(), conversationId: dbConvId, role: "user", content: message } });
        await prisma.message.create({ data: { id: uuidv4(), conversationId: dbConvId, role: "assistant", content: cleanedResponse } });

        // Extract and save lead info
        const leadInfo = extractLeadInfo(aiText);
        const hasLeadInfo = Object.values(leadInfo).some((v) => v !== null);
        if (hasLeadInfo) {
          const client = await prisma.client.findUnique({ where: { apiKey } });
          if (client) {
            const existingLead = await prisma.lead.findFirst({ where: { clientId: client.id, conversations: { some: { id: dbConvId } } } });
            if (existingLead) {
              await prisma.lead.update({ where: { id: existingLead.id }, data: { name: leadInfo.name || existingLead.name, email: leadInfo.email || existingLead.email, phone: leadInfo.phone || existingLead.phone, budget: leadInfo.budget || existingLead.budget, location: leadInfo.location || existingLead.location, propertyType: leadInfo.propertyType || existingLead.propertyType } });
            } else {
              const lead = await prisma.lead.create({ data: { id: uuidv4(), clientId: client.id, name: leadInfo.name || "", email: leadInfo.email || "", phone: leadInfo.phone || "", budget: leadInfo.budget || "", location: leadInfo.location || "", propertyType: leadInfo.propertyType || "" } });
              await prisma.conversation.update({ where: { id: dbConvId }, data: { leadId: lead.id, visitorName: leadInfo.name || "Website Visitor" } });
            }
          }
        }

        convId = dbConvId;
      } catch {
        // Database write failed, but response still goes through
      }
    }

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    return NextResponse.json({ conversationId: convId, message: cleanedResponse }, { headers });
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
