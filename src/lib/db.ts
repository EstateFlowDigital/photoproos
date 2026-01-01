import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Create a PrismaClient instance with proper Accelerate support.
 * This function ensures environment variables are read at runtime.
 */
function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  const isAccelerate = databaseUrl?.startsWith("prisma+");
  const logLevel = process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"] as const
    : ["error"] as const;

  // For Prisma Accelerate, we must pass the accelerateUrl option
  if (isAccelerate && databaseUrl) {
    return new PrismaClient({
      log: [...logLevel],
      accelerateUrl: databaseUrl,
    });
  }

  // Standard PrismaClient for direct database connections
  return new PrismaClient({
    log: [...logLevel],
  });
}

export const prisma = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
