import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateAIResponse, extractLeadInfo, cleanResponse } from "@/lib/ai";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, conversationId, message } = body;

    if (!apiKey || !message) {
      return NextResponse.json({ error: "Missing apiKey or message" }, { status: 400 });
    }

    // Validate API key and get client
    const client = await prisma.client.findUnique({ where: { apiKey } });

    if (!client) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    if (!client.isActive) {
      return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
    }

    // Check usage limits
    if (client.usageThisMonth >= client.monthlyLimit) {
      return NextResponse.json({ error: "Monthly conversation limit reached" }, { status: 429 });
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const conv = await prisma.conversation.create({
        data: {
          id: uuidv4(),
          clientId: client.id,
          visitorName: "Website Visitor",
        },
      });
      convId = conv.id;

      // Increment usage
      await prisma.client.update({
        where: { id: client.id },
        data: { usageThisMonth: { increment: 1 } },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        id: uuidv4(),
        conversationId: convId,
        role: "user",
        content: message,
      },
    });

    // Generate AI response
    const aiResponse = await generateAIResponse({
      clientId: client.id,
      conversationId: convId,
      userMessage: message,
    });

    // Extract lead information from AI response
    const leadInfo = extractLeadInfo(aiResponse);
    const cleanedResponse = cleanResponse(aiResponse);

    // Save AI response (cleaned version)
    await prisma.message.create({
      data: {
        id: uuidv4(),
        conversationId: convId,
        role: "assistant",
        content: cleanedResponse,
      },
    });

    // Update or create lead if any info was captured
    const hasLeadInfo = Object.values(leadInfo).some((v) => v !== null);
    if (hasLeadInfo) {
      const existingLead = await prisma.lead.findFirst({
        where: {
          clientId: client.id,
          conversations: { some: { id: convId } },
        },
      });

      if (existingLead) {
        // Update existing lead with new info
        await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            name: leadInfo.name || existingLead.name,
            email: leadInfo.email || existingLead.email,
            phone: leadInfo.phone || existingLead.phone,
            budget: leadInfo.budget || existingLead.budget,
            location: leadInfo.location || existingLead.location,
            propertyType: leadInfo.propertyType || existingLead.propertyType,
          },
        });
      } else {
        // Create new lead
        const lead = await prisma.lead.create({
          data: {
            id: uuidv4(),
            clientId: client.id,
            name: leadInfo.name || "",
            email: leadInfo.email || "",
            phone: leadInfo.phone || "",
            budget: leadInfo.budget || "",
            location: leadInfo.location || "",
            propertyType: leadInfo.propertyType || "",
          },
        });

        // Link conversation to lead
        await prisma.conversation.update({
          where: { id: convId },
          data: {
            leadId: lead.id,
            visitorName: leadInfo.name || "Website Visitor",
          },
        });
      }
    }

    return NextResponse.json({
      conversationId: convId,
      message: cleanedResponse,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
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
