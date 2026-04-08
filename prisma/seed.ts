import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@closerai.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeThisPassword123!";

  // Create admin user
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        id: uuidv4(),
        email: adminEmail,
        passwordHash,
        name: "Platform Admin",
        role: "admin",
      },
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log("Admin user already exists.");
  }

  // Create a demo client for testing
  const demoEmail = "demo@closerai.com";
  const demoExisting = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!demoExisting) {
    const demoHash = await hash("demo123", 12);
    const demoUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: demoEmail,
        passwordHash: demoHash,
        name: "Demo Agent",
        role: "client",
      },
    });

    const apiKey = `cai_${uuidv4().replace(/-/g, "")}`;
    await prisma.client.create({
      data: {
        id: uuidv4(),
        userId: demoUser.id,
        businessName: "Sunshine Realty Group",
        phone: "+1-555-0123",
        website: "https://sunshinerealty.example.com",
        apiKey,
        isActive: true,
        plan: "professional",
        paypalStatus: "active",
        agentName: "Sarah",
        welcomeMessage: "Hi there! I'm Sarah, your AI real estate assistant at Sunshine Realty. Whether you're looking to buy, sell, or just exploring — I'm here to help! What are you looking for?",
        brandColor: "#2563eb",
        monthlyLimit: 2000,
      },
    });

    // Add demo properties
    const client = await prisma.client.findFirst({ where: { userId: demoUser.id } });
    if (client) {
      await prisma.property.createMany({
        data: [
          {
            id: uuidv4(),
            clientId: client.id,
            title: "Modern Downtown Condo",
            description: "Stunning 2-bedroom condo with panoramic city views, modern finishes, and rooftop pool access.",
            price: 485000,
            address: "123 Main St, Unit 15A",
            city: "Miami",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1200,
            propertyType: "condo",
            status: "active",
          },
          {
            id: uuidv4(),
            clientId: client.id,
            title: "Family Home with Pool",
            description: "Spacious 4-bedroom family home with a heated pool, 2-car garage, and updated kitchen.",
            price: 725000,
            address: "456 Oak Avenue",
            city: "Miami",
            bedrooms: 4,
            bathrooms: 3,
            sqft: 2800,
            propertyType: "house",
            status: "active",
          },
          {
            id: uuidv4(),
            clientId: client.id,
            title: "Luxury Waterfront Villa",
            description: "Breathtaking 5-bedroom waterfront villa with private dock, infinity pool, and smart home features.",
            price: 2150000,
            address: "789 Bayshore Drive",
            city: "Miami Beach",
            bedrooms: 5,
            bathrooms: 4,
            sqft: 4500,
            propertyType: "house",
            status: "active",
          },
        ],
      });
    }

    console.log(`Demo client created: ${demoEmail} (password: demo123)`);
    console.log(`Demo API Key: ${apiKey}`);
  }

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
