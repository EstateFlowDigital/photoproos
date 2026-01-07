/**
 * Seed script for achievements
 * Run with: npx tsx prisma/seed-achievements.ts
 */

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { ACHIEVEMENTS } from "../src/lib/gamification/achievements";

// Parse DATABASE_URL (same as src/lib/db.ts)
function getDatabaseUrl(): string {
  const prismaUrl = process.env.DATABASE_URL;
  if (!prismaUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (prismaUrl.startsWith("prisma+postgres://")) {
    const url = new URL(prismaUrl);
    const apiKey = url.searchParams.get("api_key");
    if (apiKey) {
      try {
        const decoded = JSON.parse(Buffer.from(apiKey, "base64").toString("utf-8"));
        return decoded.databaseUrl;
      } catch {
        console.warn("Could not decode Prisma Postgres API key");
      }
    }
  }

  return prismaUrl;
}

const connectionString = getDatabaseUrl();
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🎮 Seeding achievements...");

  let created = 0;
  let updated = 0;

  for (const achievement of ACHIEVEMENTS) {
    const data = {
      slug: achievement.slug,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
      rarity: achievement.rarity,
      icon: achievement.icon,
      xpReward: achievement.xpReward,
      triggerConfig: achievement.trigger,
      isHidden: achievement.isHidden || false,
      order: achievement.order || 0,
    };

    const existing = await prisma.achievement.findUnique({
      where: { slug: achievement.slug },
    });

    if (existing) {
      await prisma.achievement.update({
        where: { slug: achievement.slug },
        data,
      });
      updated++;
    } else {
      await prisma.achievement.create({ data });
      created++;
    }
  }

  console.log(`✅ Achievements seeded: ${created} created, ${updated} updated`);
  console.log(`📊 Total achievements: ${ACHIEVEMENTS.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding achievements:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
