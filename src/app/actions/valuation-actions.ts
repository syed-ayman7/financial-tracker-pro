'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Upsert the valuation multiplier.
 * There's only ever one ValuationSetting row — we create it if it
 * doesn't exist, or update it if it does.
 */
export async function updateMultiplier(multiplier: number) {
  const existing = await prisma.valuationSetting.findFirst();

  if (existing) {
    await prisma.valuationSetting.update({
      where: { id: existing.id },
      data: { multiplier },
    });
  } else {
    await prisma.valuationSetting.create({
      data: { multiplier },
    });
  }

  revalidatePath('/dashboard');
}
