import Anthropic from "@anthropic-ai/sdk";
import prisma from "./db";

let _client: Anthropic | null = null;
function getClient() {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key || key === "YOUR_CLAUDE_API_KEY_HERE") {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    _client = new Anthropic({ apiKey: key });
  }
  return _client;
}

interface ChatContext {
  clientId: string;
  conversationId: string;
  userMessage: string;
}

export async function generateAIResponse(ctx: ChatContext): Promise<string> {
  const client = await prisma.client.findUnique({
    where: { id: ctx.clientId },
    include: { properties: { where: { status: "active" } } },
  });

  if (!client) throw new Error("Client not found");
  if (!client.isActive) throw new Error("Client account is deactivated");

  // Get conversation history
  const messages = await prisma.message.findMany({
    where: { conversationId: ctx.conversationId },
    orderBy: { createdAt: "asc" },
    take: 20, // Last 20 messages for context
  });

  // Build property listings context
  let propertyContext = "";
  if (client.properties.length > 0) {
    propertyContext = "\n\nAVAILABLE PROPERTIES:\n" +
      client.properties.map((p) =>
        `- ${p.title}: $${p.price.toLocaleString()} | ${p.bedrooms}bd/${p.bathrooms}ba | ${p.sqft} sqft | ${p.city} | ${p.propertyType}`
      ).join("\n");
  }

  const systemPrompt = `You are ${client.agentName}, an AI real estate assistant for ${client.businessName}. Your job is to:

1. ENGAGE visitors warmly and professionally
2. UNDERSTAND their real estate needs (buying, selling, renting)
3. CAPTURE their contact information naturally (name, email, phone) - this is CRITICAL
4. QUALIFY leads by understanding budget, timeline, location preferences, property type
5. RECOMMEND matching properties from the available listings
6. ENCOURAGE them to schedule a viewing or callback with the agent

IMPORTANT RULES:
- Be conversational, friendly, and helpful - not robotic
- Ask for contact info naturally, not all at once. Start with name, then work toward email/phone
- When you learn their name, email, or phone, include it in your response using these exact tags:
  [LEAD_NAME: their name] [LEAD_EMAIL: their email] [LEAD_PHONE: their phone]
  [LEAD_BUDGET: their budget] [LEAD_LOCATION: preferred location] [LEAD_TYPE: property type]
- Only include tags for information you actually received
- Never make up or assume contact details
- If they seem ready, suggest scheduling a call or viewing
- Keep responses concise (2-4 sentences typically)
- If asked about something outside real estate, gently redirect

${client.systemPrompt ? `ADDITIONAL INSTRUCTIONS FROM AGENT:\n${client.systemPrompt}` : ""}
${propertyContext}`;

  // Build message history for Claude
  const claudeMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Add current user message
  claudeMessages.push({ role: "user", content: ctx.userMessage });

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: systemPrompt,
    messages: claudeMessages,
  });

  const aiText = response.content[0].type === "text" ? response.content[0].text : "";

  return aiText;
}

// Extract lead info from AI response tags
export function extractLeadInfo(text: string) {
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
  };
}

// Remove lead tags from response before sending to user
export function cleanResponse(text: string): string {
  return text
    .replace(/\[LEAD_\w+:\s*.+?\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
