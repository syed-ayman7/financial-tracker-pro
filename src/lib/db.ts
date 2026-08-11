/**
 * Prisma Client Singleton
 *
 * In development, Next.js hot-reloads your server code on every change.
 * Without this singleton, each reload would create a new PrismaClient
 * instance, eventually exhausting the database connection pool.
 *
 * In production there's only one instance anyway, but this pattern
 * doesn't hurt.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
