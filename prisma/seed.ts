/**
 * Seed Script — Creates demo data for Fin-Tracker
 *
 * Creates 3 example products with placeholder prices/margins,
 * a couple of sample sale entries, and a default valuation setting.
 *
 * Each demo product has "[DEMO]" in the name so it's obvious
 * these should be deleted once you start entering real data.
 *
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import { calculateProfit } from '../src/lib/calculations';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...\n');

  // ── Demo Products ─────────────────────────────────────────────
  const productA = await prisma.product.upsert({
    where: { name: '[DEMO] Handmade Candle' },
    update: {},
    create: {
      name: '[DEMO] Handmade Candle',
      pricePerUnit: 450,
      profitMarginPct: 55,
      unitsManufactured: 100,
    },
  });
  console.log(`  ✅ Product A: ${productA.name} (₹${productA.pricePerUnit}, ${productA.profitMarginPct}% margin)`);

  const productB = await prisma.product.upsert({
    where: { name: '[DEMO] Custom Tote Bag' },
    update: {},
    create: {
      name: '[DEMO] Custom Tote Bag',
      pricePerUnit: 750,
      profitMarginPct: 40,
      unitsManufactured: 50,
    },
  });
  console.log(`  ✅ Product B: ${productB.name} (₹${productB.pricePerUnit}, ${productB.profitMarginPct}% margin)`);

  const productC = await prisma.product.upsert({
    where: { name: '[DEMO] Resin Coaster Set' },
    update: {},
    create: {
      name: '[DEMO] Resin Coaster Set',
      pricePerUnit: 600,
      profitMarginPct: 45,
      unitsManufactured: 30,
    },
  });
  console.log(`  ✅ Product C: ${productC.name} (₹${productC.pricePerUnit}, ${productC.profitMarginPct}% margin)`);

  // ── Demo Sale Entries ─────────────────────────────────────────
  // Use dates in the current month so they show up in "This Month" KPIs
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 5);
  const lastWeek = new Date(now.getFullYear(), now.getMonth(), Math.max(now.getDate() - 7, 1));

  // Check if demo sales already exist (avoid duplicates on re-run)
  const existingSales = await prisma.saleEntry.count();
  if (existingSales === 0) {
    await prisma.saleEntry.create({
      data: {
        productId: productA.id,
        date: thisMonth,
        quantitySold: 3,
        revenueReceived: 1350, // 3 × ₹450
        profit: calculateProfit(1350, productA.profitMarginPct), // 1350 × 0.55 = ₹742.50
      },
    });
    console.log(`  ✅ Sale: 3× ${productA.name} → ₹1,350 revenue, ₹742.50 profit`);

    await prisma.saleEntry.create({
      data: {
        productId: productB.id,
        date: lastWeek,
        quantitySold: 2,
        revenueReceived: 1500, // 2 × ₹750
        profit: calculateProfit(1500, productB.profitMarginPct), // 1500 × 0.40 = ₹600
      },
    });
    console.log(`  ✅ Sale: 2× ${productB.name} → ₹1,500 revenue, ₹600 profit`);
  } else {
    console.log(`  ⏭️  Sales already exist (${existingSales} entries), skipping demo sales`);
  }

  // ── Default Valuation Setting ─────────────────────────────────
  const existingValuation = await prisma.valuationSetting.findFirst();
  if (!existingValuation) {
    await prisma.valuationSetting.create({
      data: { multiplier: 4 },
    });
    console.log('  ✅ Valuation multiplier set to 4×');
  } else {
    console.log(`  ⏭️  Valuation multiplier already set to ${existingValuation.multiplier}×`);
  }

  console.log('\n🎉 Seed complete! Delete [DEMO] products once you start entering real data.\n');
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
