import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CITIES = ["Quito", "Cumbayá", "Guayaquil", "Cuenca", "Manta"];
const TYPES = ["Casa", "Departamento", "Terreno", "Oficina"];

async function main() {
  console.log("🌱 Starting seed...");

  // Create a default agent if not exists
  const agent = await prisma.user.upsert({
    where: { email: "agent@demo.com" },
    update: {},
    create: {
      email: "agent@demo.com",
      name: "Agente Demo",
      role: "AGENT",
      password: "hashed_password_placeholder", // In real auth this would be hashed
    },
  });

  const properties = [];

  for (let i = 0; i < 20; i++) {
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const price = Math.floor(Math.random() * (500000 - 80000) + 80000); // 80k to 500k
    const bedrooms = Math.floor(Math.random() * 5) + 1;
    
    properties.push({
      title: `${type} de Lujo en ${city} #${i + 1}`,
      description: `Hermosa propiedad ubicada en la mejor zona de ${city}. Cuenta con acabados de primera, seguridad 24/7 y áreas comunales. Ideal para tu familia.`,
      price: price,
      address: `Av. Principal y Calle ${i + 1}`,
      city: city,
      state: "Pichincha", // Simplified
      zipCode: "170102",
      latitude: -0.180653 + (Math.random() * 0.1 - 0.05), // Random variation around Quito
      longitude: -78.467834 + (Math.random() * 0.1 - 0.05),
      bedrooms: bedrooms,
      bathrooms: Math.floor(Math.random() * 4) + 1,
      area: Math.floor(Math.random() * 300) + 60,
      parking: Math.floor(Math.random() * 3),
      yearBuilt: 2015 + Math.floor(Math.random() * 9),
      status: "PUBLISHED",
      featured: Math.random() > 0.8,
      userId: agent.id,
      slug: `${type.toLowerCase()}-${city.toLowerCase()}-${i + 1}-${Date.now()}`,
      images: [
        "https://images.unsplash.com/photo-1600596542815-22b8c36ec302?q=80&w=2075&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
      ]
    });
  }

  // Batch insert
  // Note: Prisma createMany doesn't support nested relations in all DBs, but works for simple models
  // For relations usually we use a loop or proper nested create. 
  // Here we loop to be safe with potential relations constraints.
  for (const prop of properties) {
    await prisma.property.create({ data: prop });
  }

  console.log("✅ Seed finished. Created 20 properties.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
