'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createMarketingSpend(formData: FormData) {
  const date = new Date(formData.get('date') as string);
  const channel = (formData.get('channel') as string) || null;
  const amount = parseFloat(formData.get('amount') as string);

  await prisma.marketingSpend.create({
    data: { date, channel, amount },
  });

  revalidatePath('/marketing');
  revalidatePath('/dashboard');
}

export async function updateMarketingSpend(id: string, formData: FormData) {
  const date = new Date(formData.get('date') as string);
  const channel = (formData.get('channel') as string) || null;
  const amount = parseFloat(formData.get('amount') as string);

  await prisma.marketingSpend.update({
    where: { id },
    data: { date, channel, amount },
  });

  revalidatePath('/marketing');
  revalidatePath('/dashboard');
}

export async function deleteMarketingSpend(id: string) {
  await prisma.marketingSpend.delete({ where: { id } });

  revalidatePath('/marketing');
  revalidatePath('/dashboard');
}
