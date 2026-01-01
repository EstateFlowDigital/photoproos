import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

/**
 * Create a singleton PrismaClient instance with PostgreSQL adapter.
 * Prisma 7 requires an adapter for the default "client" engine type.
 * In development, we use globalThis to preserve the client across hot reloads.
 */
function getPrismaClient(): PrismaClient {
  if (globalThis.__prismaClient) {
    return globalThis.__prismaClient;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Create a PostgreSQL connection pool
  const pool = new Pool({
    connectionString,
    // Connection pool settings optimized for serverless
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Create the Prisma adapter
  const adapter = new PrismaPg(pool);

  // Create PrismaClient with the adapter
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__prismaClient = client;
  }

  return client;
}

export const prisma = getPrismaClient();
export default prisma;
