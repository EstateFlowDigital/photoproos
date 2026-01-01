import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

// Check if using Prisma Accelerate (prisma+postgres:// or prisma+mysql://)
const isAccelerate = databaseUrl?.startsWith("prisma+");

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    ...(isAccelerate && {
      // For Prisma Accelerate, use the accelerateUrl option
      accelerateUrl: databaseUrl,
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
