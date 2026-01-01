import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
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

/**
 * Lazy-initialized Prisma client using a Proxy.
 * This prevents PrismaClient instantiation during build time (module load).
 * The actual client is only created when first accessed at runtime.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    // Lazily create the client on first access
    if (!globalThis.__prismaClient) {
      globalThis.__prismaClient = createPrismaClient();
    }
    const client = globalThis.__prismaClient;
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    // Bind functions to the client instance
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});

export default prisma;
