'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { calculateProfit } from '@/lib/calculations';

export async function createSale(formData: FormData) {
  const productId = formData.get('productId') as string;
  const date = new Date(formData.get('date') as string);
  const quantitySold = parseInt(formData.get('quantitySold') as string);
  const revenueReceived = parseFloat(formData.get('revenueReceived') as string);

  // Look up the product's profit margin to compute profit at time of entry
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
  });

  // profit = revenueReceived × (profitMarginPct / 100)
  const profit = calculateProfit(revenueReceived, product.profitMarginPct);

  await prisma.saleEntry.create({
    data: { productId, date, quantitySold, revenueReceived, profit },
  });

  revalidatePath('/sales');
  revalidatePath('/dashboard');
}

export async function updateSale(id: string, formData: FormData) {
  const productId = formData.get('productId') as string;
  const date = new Date(formData.get('date') as string);
  const quantitySold = parseInt(formData.get('quantitySold') as string);
  const revenueReceived = parseFloat(formData.get('revenueReceived') as string);

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
  });

  // Re-compute profit with current margin in case it changed
  const profit = calculateProfit(revenueReceived, product.profitMarginPct);

  await prisma.saleEntry.update({
    where: { id },
    data: { productId, date, quantitySold, revenueReceived, profit },
  });

  revalidatePath('/sales');
  revalidatePath('/dashboard');
}

export async function deleteSale(id: string) {
  await prisma.saleEntry.delete({ where: { id } });

  revalidatePath('/sales');
  revalidatePath('/dashboard');
}
