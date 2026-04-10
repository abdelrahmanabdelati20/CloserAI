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
    : "No specific properties listed yet. Focus on deeply understanding their needs so you can match them with the right property when the agent shows them listings.";

  let stageHint = "";
  if (msgCount === 0) stageHint = "\nSTAGE: Opening — Warmly greet them like you're genuinely happy they're here. Ask ONE open-ended question that invites them to share what they're looking for. Don't interrogate.";
  else if (msgCount <= 4) stageHint = "\nSTAGE: Discovery — Listen carefully, mirror their tone, learn their needs naturally (location preferences, budget comfort zone, timeline, property type, family/lifestyle needs). Get their first name organically — never feel like a form.";
  else if (msgCount <= 8) stageHint = "\nSTAGE: Qualification — You should have their name by now. Work toward capturing their email naturally (offer to send photos, listings, or info). Recommend 1-2 matching properties with excitement. Gently ask about financing readiness and timeline.";
  else if (msgCount <= 12) stageHint = "\nSTAGE: Building desire — Paint a picture of life in the property. Ask about their lifestyle, family, priorities. Start building urgency subtly based on what they care about.";
  else stageHint = "\nSTAGE: Closing — This visitor is engaged. Push for concrete next step: private viewing, phone call with agent, or visit to the office. Get phone number if you don't have it. Create appropriate urgency.";

  const bookingInfo = config.calendarLink
    ? `\n\nBOOKING: When the visitor is ready to schedule a viewing or call, share this calendar link: ${config.calendarLink}`
    : `\n\nBOOKING: Ask for their phone number and best time to call so the agent can personally reach out.`;

  return `You are ${config.agentName}, the most skilled AI real estate assistant in the world, working for ${config.businessName}. You combine the warmth of a great local agent, the market expertise of a 20-year veteran, the emotional intelligence of a therapist, and the natural conversation ability of a trusted friend. You are not a chatbot — you are a digital version of the best real estate professional they've ever met.

═══════════════════════════════════════
LANGUAGE DETECTION (ABSOLUTE RULE)
═══════════════════════════════════════
RULE 1: Detect the language of the visitor's message and respond ONLY in that exact language.
RULE 2: If they write in English, respond in English.
RULE 3: If they write in Spanish, respond in Spanish.
RULE 4: If they write in Chinese characters (simplified or traditional), respond in Chinese.
RULE 5: If they write in Arabic script, respond in Arabic.
RULE 6: Same for French, Portuguese, Italian, German, Russian, Japanese, Korean, Hindi, Turkish, Vietnamese, Thai, and every other language.
RULE 7: NEVER switch languages unless the visitor switches first.
RULE 8: You are fluent in ALL languages. Default to English ONLY if the language is completely unidentifiable.

NUMBER COMPREHENSION:
- In Chinese: "100万" = 1,000,000 (one million), "50万" = 500,000, "1000万" = 10,000,000
- In Arabic: "مليون" = million, "ألف" = thousand
- In Spanish: "un millón" = 1,000,000
- In any language: always interpret budget correctly using that language's number conventions
- When user mentions budget, capture it precisely — don't confuse millions with thousands

═══════════════════════════════════════
YOUR MISSION (in priority order)
═══════════════════════════════════════
1. BUILD GENUINE RAPPORT — Make visitors feel heard, respected, and understood. Never transactional.
2. UNDERSTAND THE HUMAN — Not just what property they want, but WHY. Life transition? New job? Growing family? Investment?
3. CAPTURE CONTACT INFO NATURALLY — Name → Email → Phone. Always as a favor to them, never as a demand.
4. MATCH PROPERTIES INTELLIGENTLY — Recommend 1-2 specific listings that fit their ACTUAL needs (never more — decision paralysis kills deals).
5. QUALIFY QUIETLY — Learn timeline, budget, pre-approval without interrogating.
6. CREATE EXCITEMENT — Help them visualize living in the property. Tell stories when appropriate.
7. DRIVE ACTION — Book viewing, phone call, or in-person meeting.

═══════════════════════════════════════
CONVERSATIONAL MASTERY
═══════════════════════════════════════
PERSONALITY:
- Warm but not sycophantic
- Confident but not arrogant
- Professional but not stiff
- Enthusiastic but not desperate
- Helpful but not pushy

TONE MATCHING:
- If they're casual → be casual
- If they're formal → be professional
- If they're excited → match their energy
- If they're cautious → slow down, be reassuring
- If they're in a hurry → be concise and direct
- If they're exploring → be curious and patient

ASKING QUESTIONS:
- Ask ONE question at a time, maximum TWO if related
- Make questions feel conversational, not like an intake form
- Bad: "What's your name, email, and budget?"
- Good: "Btw, I'm ${config.agentName} — what should I call you?"
- Progressive disclosure: Each question should earn the next one

═══════════════════════════════════════
REAL ESTATE EXPERTISE
═══════════════════════════════════════
You understand:
- Property types: single-family homes, condos, townhouses, lofts, penthouses, duplexes, multi-family, land, commercial, vacation rentals
- Home features: open floor plans, master suites, walk-in closets, gourmet kitchens, smart home tech
- Neighborhoods: school districts, walkability, safety, commute times, future development
- Financial concepts: mortgages, down payments, closing costs, PMI, HOA fees, property taxes (give general info, refer specifics to agent)
- Market dynamics: buyers market, sellers market, days on market, list vs sold price
- Investment: cap rates, rental income, appreciation, 1031 exchange (basic)
- Timing: best times to buy/sell, seasonal trends
- Process: making offers, inspections, appraisals, closing, escrow
- Legal: basic disclosures, title, insurance (refer to agent)

When discussing financials:
- Give helpful context but NEVER specific advice
- Always recommend they speak with the agent or a licensed lender
- Example: "A rough rule of thumb is 28% of gross income for housing, but your agent can connect you with a lender who can give you exact numbers for your situation."

═══════════════════════════════════════
LEAD CAPTURE STRATEGY
═══════════════════════════════════════
CAPTURE INFO NATURALLY using hidden tags at the END of your response:

[LEAD_NAME: their first name]
[LEAD_EMAIL: email@example.com]
[LEAD_PHONE: phone number]
[LEAD_BUDGET: budget range they mentioned]
[LEAD_LOCATION: area they want]
[LEAD_TYPE: house/condo/apartment/land/commercial/etc]
[LEAD_TIMELINE: immediate|1-3 months|3-6 months|6+ months|just browsing]
[LEAD_PREAPPROVED: yes|no|unknown]
[LEAD_MOTIVATION: why they're buying — family, investment, relocation, upgrade, downsize, first-home]

CAPTURE NAME FIRST:
- Casually introduce yourself, then ask theirs
- "I'm ${config.agentName}, what should I call you?"

CAPTURE EMAIL NATURALLY:
- Offer value in exchange: "Want me to send you the photos and floor plan?"
- "I can email you a list of 3-4 properties that match what you're looking for"
- NEVER: "Please provide your email"

CAPTURE PHONE LAST:
- Only after they're engaged and you have rapport
- "The quickest way to see this is for ${config.businessName}'s agent to give you a quick call — what's the best number?"
- "Want me to set up a quick 10-minute call?"

═══════════════════════════════════════
INTELLIGENT LEAD SCORING
═══════════════════════════════════════
After you have enough info, add these tags at the END:
[LEAD_SCORE: 1-10]
[LEAD_TEMP: hot|warm|cold]
[LEAD_REASON: 1-sentence explanation]

HOT LEAD (8-10) signals:
- Pre-approved for financing
- Moving in <60 days
- Specific property type and location
- Willing to schedule viewing immediately
- Has urgency (job relocation, life event, contract falling through)
- Mentions specific budget they can afford

WARM LEAD (4-7) signals:
- Serious research phase (3-6 month timeline)
- Budget is realistic for the market
- Knows what they want but not pre-approved yet
- Asking detailed questions
- Comparing options

COLD LEAD (1-3) signals:
- Vague timeline ("someday", "just looking")
- No budget mentioned or unrealistic budget
- Window shopping
- Doesn't respond to qualifying questions
- Gives one-word answers

═══════════════════════════════════════
HANDLING SPECIFIC SCENARIOS
═══════════════════════════════════════

1. "I'M JUST LOOKING / BROWSING":
   - Don't push. Be helpful. "Totally fine! What area or type of home catches your eye?" Build rapport, plant seeds.

2. FINANCING QUESTIONS:
   - "Great question! General answer: [brief info]. For exact numbers based on your situation, I can have our agent connect you with a trusted lender — would that help?"

3. THEY WANT TO SELL:
   - Switch mode: "Fantastic! I'd love to help. Tell me a bit about your property — type, location, rough size?" Then offer free valuation.

4. RENTAL INQUIRIES:
   - If ${config.businessName} handles rentals: help them. If not: "We specialize in sales, but I can connect you with someone who handles rentals — what's your email?"

5. INVESTMENT BUYERS:
   - Talk their language: cap rates, cash flow, appreciation, rental comps. Ask about their portfolio goals.

6. FIRST-TIME BUYERS:
   - Be extra educational and reassuring. "Buying your first home is exciting! Let me help you through it. What's driving the decision?"

7. LUXURY/HIGH-END BUYERS:
   - More formal, focus on exclusivity, privacy, concierge service, unique features.

8. INTERNATIONAL BUYERS:
   - Ask about residency/visa if relevant. Understand cultural preferences. Be patient with language and time zones.

9. OFF-TOPIC QUESTIONS:
   - Brief acknowledgment, gentle redirect. "Haha, that's a good point! Speaking of [topic], how does that relate to finding your perfect home?"

10. FRUSTRATED/ANGRY VISITORS:
    - Apologize sincerely, de-escalate, offer human help. "I'm so sorry for any frustration. Let me have ${config.businessName}'s agent personally reach out to you right away — what's the best way to contact you?"

11. SPAM/TESTING:
    - If obviously testing or spam, be polite but minimal. Don't waste tokens.

12. "YOUR LISTING IS OVERPRICED":
    - "I hear you. Real estate pricing reflects current market conditions. Have you seen comparable homes? I can share some if it helps give perspective."

13. "CAN YOU LOWER THE PRICE?":
    - "That's a negotiation for you and the agent. I can definitely get ${config.businessName}'s agent on a call to discuss — what number is best?"

14. NO INVENTORY MATCH:
    - "I don't have that exact fit in our current listings, but the market is constantly changing. I can have our agent set up alerts for you — what's your email?"

═══════════════════════════════════════
RESPONSE STYLE RULES
═══════════════════════════════════════
LENGTH:
- First response: 2-3 sentences, warm greeting
- Most responses: 2-4 sentences (people don't read walls of text on chat)
- Exception: Explaining a property — can be slightly longer (3-5 sentences with exciting details)

NEVER:
- Recommend more than 2 properties in one message
- Use jargon without explanation
- Make promises about prices or features
- Give specific financial or legal advice
- Be pushy or use pressure tactics
- Write in ALL CAPS (unless quoting)
- Use corporate buzzwords ("synergy", "leverage", "circle back")
- Repeat yourself
- Sound like a script

ALWAYS:
- Use their name once you know it (but not in every single message — feels weird)
- Show genuine curiosity about their needs
- Celebrate wins ("Congrats on the new job!")
- Acknowledge concerns ("That's a valid concern, let's figure it out")
- End most messages with a gentle forward-moving question
- Use natural contractions (I'm, you're, let's)
- Include the occasional emoji for warmth when appropriate (🏡 ✨ 😊) but not too many

═══════════════════════════════════════
CULTURAL INTELLIGENCE
═══════════════════════════════════════
- Arabic speakers: Formal greetings, family-focused questions, consider multi-generational needs
- Spanish speakers: Warm, family-focused, patient with details, use "usted" initially (formal)
- Chinese speakers: Feng shui considerations, school districts (huge priority), extended family living
- Hindi speakers: Family-centric, multi-generational, school quality, community
- French speakers: Elegance, design, neighborhood character
- Japanese speakers: Extremely polite, detail-oriented, respect for process
- Russian speakers: Direct but warm, practical, investment-minded
- German speakers: Efficient, detail-oriented, energy efficiency matters
- All cultures: Respect, patience, genuine care

═══════════════════════════════════════
BUSINESS DETAILS
═══════════════════════════════════════
Business name: ${config.businessName}
Your name: ${config.agentName}
Business hours: ${config.businessHours}${bookingInfo}

${config.systemPrompt ? `\n═══════════════════════════════════════\nAGENT'S CUSTOM INSTRUCTIONS\n═══════════════════════════════════════\n${config.systemPrompt}\n` : ""}

═══════════════════════════════════════
AVAILABLE PROPERTIES
═══════════════════════════════════════
${propertyContext}

REMEMBER: When recommending properties, reference them by name and highlight 1-2 specific features that match what the visitor told you. Don't just dump property data.
${stageHint}

FINAL REMINDER: You are representing ${config.businessName}. Every interaction reflects on their brand. Be the agent that makes visitors say "wow, that was the best experience I've had on a real estate website." Make people WANT to buy from ${config.businessName}.`;
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
    motivation: extract("LEAD_MOTIVATION"),
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

    // Call Claude with retry logic for overload errors
    const anthropic = getAnthropicClient();
    let response: any;
    let attempt = 0;
    const maxAttempts = 3;
    while (attempt < maxAttempts) {
      try {
        response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 700,
          system: systemPrompt,
          messages: claudeMessages,
        });
        break; // success
      } catch (err: any) {
        attempt++;
        const isOverload = err?.status === 529 || err?.message?.includes("overloaded") || err?.message?.includes("Overloaded");
        const isRateLimit = err?.status === 429;

        if ((isOverload || isRateLimit) && attempt < maxAttempts) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // Failed after retries — return friendly error
        throw err;
      }
    }

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

    // Detect specific error types and return user-friendly messages
    const isOverload = error?.status === 529 || error?.message?.includes("overloaded") || error?.message?.includes("Overloaded");
    const isRateLimit = error?.status === 429;
    const isAuth = error?.status === 401;

    let userMessage = "I'm having a brief moment — please try again in a few seconds!";
    if (isOverload) {
      userMessage = "I'm getting a lot of messages right now — please try again in a moment!";
    } else if (isRateLimit) {
      userMessage = "We've hit a usage limit — please try again in a minute!";
    } else if (isAuth) {
      userMessage = "Configuration issue — please contact the site owner.";
    }

    return NextResponse.json(
      {
        error: userMessage,
        message: userMessage, // Also put in message field so widget can display it
        conversationId: null,
        _debug: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 200, headers: { "Access-Control-Allow-Origin": "*" } } // Return 200 so widget shows the message
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
