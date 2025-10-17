/**
 * Seed Script: Properties with Coordinates for Map Testing
 *
 * Creates test properties in Cuenca, Ecuador with valid lat/lng
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding map properties...');

  // Find or create a test agent
  let agent = await prisma.user.findFirst({
    where: { role: 'AGENT' },
  });

  if (!agent) {
    agent = await prisma.user.create({
      data: {
        email: 'agent@inmoapp.com',
        name: 'Agente Demo',
        role: 'AGENT',
        phone: '+593 99 123 4567',
      },
    });
    console.log('✅ Created test agent:', agent.email);
  }

  // Cuenca neighborhoods with real coordinates
  const properties = [
    {
      title: 'Casa moderna en El Ejido',
      description: 'Hermosa casa con acabados de lujo en el corazón de El Ejido',
      price: 185000,
      transactionType: 'SALE' as const,
      category: 'HOUSE' as const,
      status: 'AVAILABLE' as const,
      bedrooms: 3,
      bathrooms: 2.5,
      area: 180,
      address: 'Av. 12 de Abril y Calle Larga',
      city: 'Cuenca',
      state: 'Azuay',
      zipCode: '010150',
      latitude: -2.8995, // El Ejido
      longitude: -79.0044,
      agentId: agent.id,
    },
    {
      title: 'Departamento en Sector Yanuncay',
      description: 'Moderno departamento con vista panorámica',
      price: 95000,
      transactionType: 'SALE' as const,
      category: 'APARTMENT' as const,
      status: 'AVAILABLE' as const,
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      address: 'Av. Ordóñez Lasso',
      city: 'Cuenca',
      state: 'Azuay',
      zipCode: '010107',
      latitude: -2.8875,
      longitude: -79.0125,
      agentId: agent.id,
    },
    {
      title: 'Villa de lujo en Monay',
      description: 'Espectacular villa con jardín amplio y piscina',
      price: 320000,
      transactionType: 'SALE' as const,
      category: 'VILLA' as const,
      status: 'AVAILABLE' as const,
      bedrooms: 4,
      bathrooms: 3.5,
      area: 350,
      address: 'Sector Monay Golf',
      city: 'Cuenca',
      state: 'Azuay',
      zipCode: '010102',
      latitude: -2.9145,
      longitude: -78.9875,
      agentId: agent.id,
    },
    {
      title: 'Suite en arriendo Centro Histórico',
      description: 'Acogedora suite completamente amoblada',
      price: 450,
      transactionType: 'RENT' as const,
      category: 'SUITE' as const,
      status: 'AVAILABLE' as const,
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      address: 'Calle Bolívar y Hermano Miguel',
      city: 'Cuenca',
      state: 'Azuay',
      zipCode: '010101',
      latitude: -2.9005,
      longitude: -79.0035,
      agentId: agent.id,
    },
    {
      title: 'Penthouse exclusivo Av. Remigio Crespo',
      description: 'Penthouse de 2 plantas con terraza privada',
      price: 245000,
      transactionType: 'SALE' as const,
      category: 'PENTHOUSE' as const,
      status: 'AVAILABLE' as const,
      bedrooms: 3,
      bathrooms: 3,
      area: 220,
      address: 'Av. Remigio Crespo Toral',
      city: 'Cuenca',
      state: 'Azuay',
      zipCode: '010104',
      latitude: -2.9115,
      longitude: -79.0095,
      agentId: agent.id,
    },
    {
      title: 'Terreno en Ricaurte',
      description: 'Terreno plano ideal para construcción',
      price: 45000,
      transactionType: 'SALE' as const,
      category: 'LAND' as const,
      status: 'AVAILABLE' as const,
      bedrooms: 0,
      bathrooms: 0,
      area: 500,
      address: 'Vía a Ricaurte',
      city: 'Cuenca',
      state: 'Azuay',
      zipCode: '010250',
      latitude: -2.8755,
      longitude: -78.9965,
      agentId: agent.id,
    },
    {
      title: 'Casa en arriendo Sector Miraflores',
      description: 'Casa familiar en zona tranquila',
      price: 650,
      transactionType: 'RENT' as const,
      category: 'HOUSE' as const,
      status: 'AVAILABLE' as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      address: 'Sector Miraflores',
      city: 'Cuenca',
      state: 'Azuay',
      zipCode: '010105',
      latitude: -2.8945,
      longitude: -79.0155,
      agentId: agent.id,
    },
    {
      title: 'Local comercial Av. de las Américas',
      description: 'Local en zona comercial de alta circulación',
      price: 1200,
      transactionType: 'RENT' as const,
      category: 'COMMERCIAL' as const,
      status: 'AVAILABLE' as const,
      bedrooms: 0,
      bathrooms: 2,
      area: 120,
      address: 'Av. de las Américas',
      city: 'Cuenca',
      state: 'Azuay',
      zipCode: '010103',
      latitude: -2.9055,
      longitude: -79.0185,
      agentId: agent.id,
    },
  ];

  // Create properties
  for (const property of properties) {
    const created = await prisma.property.create({
      data: property,
    });
    console.log(`✅ Created: ${created.title} (${created.latitude}, ${created.longitude})`);
  }

  console.log('🎉 Seeding complete! Created', properties.length, 'properties');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
