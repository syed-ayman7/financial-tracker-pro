'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const pricePerUnit = parseFloat(formData.get('pricePerUnit') as string);
  const profitMarginPct = parseFloat(formData.get('profitMarginPct') as string);
  const unitsManufactured = parseInt(formData.get('unitsManufactured') as string) || 0;

  await prisma.product.create({
    data: { name, pricePerUnit, profitMarginPct, unitsManufactured },
  });

  revalidatePath('/products');
  revalidatePath('/dashboard');
  revalidatePath('/sales');
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const pricePerUnit = parseFloat(formData.get('pricePerUnit') as string);
  const profitMarginPct = parseFloat(formData.get('profitMarginPct') as string);
  const unitsManufactured = parseInt(formData.get('unitsManufactured') as string) || 0;

  await prisma.product.update({
    where: { id },
    data: { name, pricePerUnit, profitMarginPct, unitsManufactured },
  });

  revalidatePath('/products');
  revalidatePath('/dashboard');
}

export async function deleteProduct(id: string) {
  // Cascade delete is configured in Prisma schema, so deleting
  // a product also removes its associated sale entries
  await prisma.product.delete({ where: { id } });

  revalidatePath('/products');
  revalidatePath('/dashboard');
  revalidatePath('/sales');
}
