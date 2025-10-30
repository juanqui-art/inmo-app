#!/usr/bin/env bun
/**
 * Check available locations in database
 * Run: bun run scripts/check-locations.ts
 */

import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking available locations in database...\n');

  // Get distinct cities
  const cities = await prisma.property.findMany({
    where: {
      city: {
        not: null,
      },
    },
    select: {
      city: true,
    },
    distinct: ['city'],
    orderBy: {
      city: 'asc',
    },
  });

  console.log(`📍 Found ${cities.length} distinct cities:`);
  cities.forEach((c) => console.log(`   - ${c.city}`));

  // Get distinct addresses/neighborhoods
  const addresses = await prisma.property.findMany({
    where: {
      address: {
        not: null,
      },
    },
    select: {
      address: true,
      city: true,
    },
    take: 20, // Limit to 20 for readability
    orderBy: {
      address: 'asc',
    },
  });

  console.log(`\n🏘️  Sample addresses (first 20):`);
  addresses.forEach((a) => console.log(`   - ${a.address} (${a.city})`));

  // Get statistics
  const stats = await prisma.property.groupBy({
    by: ['city'],
    _count: {
      city: true,
    },
    orderBy: {
      _count: {
        city: 'desc',
      },
    },
  });

  console.log(`\n📊 Properties per city:`);
  stats.forEach((s) => console.log(`   - ${s.city}: ${s._count.city} properties`));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
