import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const DEMO_API_KEY = "cai_44d60f6ac0e849d78060792f010730ed";

  // Find any demo client
  const clients = await prisma.client.findMany();
  console.log("Found clients:", clients.length);
  clients.forEach(c => console.log("-", c.businessName, c.apiKey.slice(0, 20)));

  // Delete ALL existing properties for all demo/sunshine clients
  for (const c of clients) {
    if (c.businessName.toLowerCase().includes("sunshine") || c.apiKey === DEMO_API_KEY) {
      const deleted = await prisma.property.deleteMany({ where: { clientId: c.id } });
      console.log(`Deleted ${deleted.count} properties from ${c.businessName}`);

      // Add the 6 correct properties
      const properties = [
        { title: "Modern Downtown Condo", description: "Stunning 2-bedroom condo with panoramic city views, modern finishes, and rooftop pool access.", price: 485000, address: "123 Main St, Unit 15A", city: "Miami", bedrooms: 2, bathrooms: 2, sqft: 1200, propertyType: "condo" },
        { title: "Family Home with Pool", description: "Spacious 4-bedroom family home with a heated pool, 2-car garage, and updated kitchen.", price: 725000, address: "456 Oak Avenue", city: "Coral Gables", bedrooms: 4, bathrooms: 3, sqft: 2800, propertyType: "house" },
        { title: "Luxury Waterfront Villa", description: "Breathtaking 5-bedroom waterfront villa with private dock, infinity pool, and smart home features.", price: 2150000, address: "789 Bayshore Drive", city: "Miami Beach", bedrooms: 5, bathrooms: 4, sqft: 4500, propertyType: "house" },
        { title: "Beachfront Penthouse", description: "Luxury 3-bedroom penthouse with panoramic ocean views, private terrace, and 24/7 concierge service.", price: 1485000, address: "1000 Collins Avenue, PH1", city: "South Beach", bedrooms: 3, bathrooms: 3, sqft: 2100, propertyType: "condo" },
        { title: "Charming Coconut Grove", description: "Charming 3-bedroom home with tropical garden, mature trees, and walking distance to the marina.", price: 895000, address: "2525 Bayshore Lane", city: "Coconut Grove", bedrooms: 3, bathrooms: 2, sqft: 2200, propertyType: "house" },
        { title: "Contemporary Brickell Loft", description: "Modern 2-bedroom loft with floor-to-ceiling windows, building amenities, and valet parking.", price: 625000, address: "45 SW 9th Street, Unit 2305", city: "Brickell", bedrooms: 2, bathrooms: 2, sqft: 1500, propertyType: "condo" },
      ];

      for (const p of properties) {
        await prisma.property.create({
          data: {
            id: uuidv4(),
            clientId: c.id,
            title: p.title,
            description: p.description,
            price: p.price,
            address: p.address,
            city: p.city,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            sqft: p.sqft,
            propertyType: p.propertyType,
            status: "active",
          },
        });
      }
      console.log(`Added ${properties.length} properties to ${c.businessName}`);
    }
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
