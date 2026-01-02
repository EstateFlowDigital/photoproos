import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

/**
 * Parse the Prisma Postgres URL to get the actual database connection string.
 * Prisma Postgres (local dev) uses an HTTP URL with a base64-encoded API key
 * that contains the actual TCP database URL.
 */
function getDatabaseUrl(): string {
  const prismaUrl = process.env.DATABASE_URL;
  if (!prismaUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Check if it's a Prisma Postgres URL (contains api_key)
  if (prismaUrl.startsWith("prisma+postgres://")) {
    const url = new URL(prismaUrl);
    const apiKey = url.searchParams.get("api_key");
    if (apiKey) {
      try {
        const decoded = JSON.parse(Buffer.from(apiKey, "base64").toString("utf-8"));
        return decoded.databaseUrl;
      } catch {
        // If decoding fails, try using the URL as-is
        console.warn("Could not decode Prisma Postgres API key");
      }
    }
  }

  return prismaUrl;
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

  const connectionString = getDatabaseUrl();

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
