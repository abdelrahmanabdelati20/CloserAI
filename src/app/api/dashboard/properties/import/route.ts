import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import Anthropic from "@anthropic-ai/sdk";

// Import properties from URL (scrape) or CSV text
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = (session.user as any).clientId;
  if (!clientId) return NextResponse.json({ error: "Not a client" }, { status: 403 });

  const body = await req.json();
  const { type, url, csv } = body;

  try {
    let properties: any[] = [];

    if (type === "url" && url) {
      properties = await scrapeWebsite(url);
    } else if (type === "csv" && csv) {
      properties = parseCSV(csv);
    } else {
      return NextResponse.json({ error: "Invalid import type or missing data" }, { status: 400 });
    }

    // Save properties to database
    let savedCount = 0;
    for (const p of properties) {
      try {
        await prisma.property.create({
          data: {
            id: uuidv4(),
            clientId,
            title: p.title || "Untitled Property",
            description: p.description || "",
            price: parseFloat(p.price) || 0,
            address: p.address || "",
            city: p.city || "",
            bedrooms: parseInt(p.bedrooms) || 0,
            bathrooms: parseInt(p.bathrooms) || 0,
            sqft: parseInt(p.sqft) || 0,
            propertyType: p.propertyType || "house",
            imageUrl: p.imageUrl || "",
          },
        });
        savedCount++;
      } catch {}
    }

    return NextResponse.json({ success: true, imported: savedCount, total: properties.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Import failed" }, { status: 500 });
  }
}

// Use AI to extract properties from a website
async function scrapeWebsite(url: string): Promise<any[]> {
  // Fetch the website HTML
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch website: ${res.status}`);

  let html = await res.text();

  // Strip scripts, styles, and minimize whitespace
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/\s+/g, " ").trim();

  // Limit to 20k chars to stay within AI context
  if (html.length > 20000) html = html.substring(0, 20000);

  // Use Claude to extract property listings
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Extract all real estate property listings from this HTML. Return a JSON array of properties with these exact fields:
[
  {
    "title": "Property name or short description",
    "description": "Full description if available",
    "price": number (just the number, no $ or commas),
    "address": "street address",
    "city": "city name",
    "bedrooms": number,
    "bathrooms": number,
    "sqft": number,
    "propertyType": "house" | "condo" | "apartment" | "land" | "commercial",
    "imageUrl": "url if available"
  }
]

Only include properties you can find clearly in the HTML. If no properties found, return [].
Return ONLY the JSON array, no other text.

HTML:
${html}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";
  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}

// Parse CSV text into properties array
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const properties: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const prop: any = {};
    headers.forEach((header, idx) => {
      const val = values[idx] || "";
      // Map common header variations
      if (header.includes("title") || header.includes("name")) prop.title = val;
      else if (header.includes("desc")) prop.description = val;
      else if (header.includes("price") || header.includes("cost")) prop.price = val.replace(/[$,]/g, "");
      else if (header.includes("address") || header.includes("street")) prop.address = val;
      else if (header.includes("city") || header.includes("town")) prop.city = val;
      else if (header.includes("bed")) prop.bedrooms = val;
      else if (header.includes("bath")) prop.bathrooms = val;
      else if (header.includes("sqft") || header.includes("sq ft") || header.includes("square")) prop.sqft = val;
      else if (header.includes("type")) prop.propertyType = val.toLowerCase();
      else if (header.includes("image") || header.includes("photo")) prop.imageUrl = val;
    });
    if (prop.title || prop.address) properties.push(prop);
  }

  return properties;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else current += char;
  }
  result.push(current.trim());
  return result;
}
