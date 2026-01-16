/**
 * Diagnostic script to check homepage status in database
 * Run with: npx tsx prisma/check-homepage.ts
 */

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

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
  console.log("🔍 Checking homepage status in database...\n");

  // Check if homepage exists
  const homepage = await prisma.marketingPage.findUnique({
    where: { slug: "homepage" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      pageType: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      hasDraft: true,
      content: true,
    },
  });

  if (!homepage) {
    console.log("❌ Homepage record NOT FOUND in database!");
    console.log("\n📋 Action needed: Run 'npx tsx prisma/seed-marketing.ts' to create homepage record");

    // List all existing marketing pages
    const allPages = await prisma.marketingPage.findMany({
      select: { slug: true, status: true },
      orderBy: { slug: "asc" },
    });

    console.log(`\n📄 Existing marketing pages (${allPages.length} total):`);
    allPages.forEach((p) => console.log(`   - ${p.slug} (${p.status})`));
    return;
  }

  console.log("✅ Homepage record found!\n");
  console.log("   ID:", homepage.id);
  console.log("   Slug:", homepage.slug);
  console.log("   Title:", homepage.title);
  console.log("   Status:", homepage.status);
  console.log("   Page Type:", homepage.pageType);
  console.log("   Has Draft:", homepage.hasDraft);
  console.log("   Published At:", homepage.publishedAt);
  console.log("   Created At:", homepage.createdAt);
  console.log("   Updated At:", homepage.updatedAt);

  const hasContent = homepage.content && Object.keys(homepage.content as object).length > 0;
  console.log("   Has Content:", hasContent);

  if (hasContent) {
    const contentKeys = Object.keys(homepage.content as object);
    console.log("   Content Sections:", contentKeys.join(", "));
  }

  // Check if the issue is status
  if (homepage.status !== "published") {
    console.log("\n⚠️  Homepage status is NOT 'published'!");
    console.log("   Current status:", homepage.status);
    console.log("\n📋 Fixing: Setting status to 'published'...");

    await prisma.marketingPage.update({
      where: { slug: "homepage" },
      data: {
        status: "published",
        publishedAt: new Date(),
      },
    });

    console.log("✅ Homepage status updated to 'published'!");
  } else {
    console.log("\n✅ Homepage status is correctly set to 'published'");
  }

  // Check content schema
  if (!hasContent) {
    console.log("\n⚠️  Homepage has no content!");
    console.log("📋 Action needed: Run 'npx tsx prisma/update-homepage-content.ts' to add content");
  } else {
    const content = homepage.content as Record<string, unknown>;
    const requiredSections = ["hero", "logos", "metrics", "howItWorks", "testimonials", "pricing", "cta"];
    const missingSections = requiredSections.filter((s) => !content[s]);

    if (missingSections.length > 0) {
      console.log("\n⚠️  Homepage is missing some content sections:");
      missingSections.forEach((s) => console.log(`   - ${s}`));
      console.log("\n📋 Action needed: Run 'npx tsx prisma/update-homepage-content.ts' to update content");
    } else {
      console.log("✅ Homepage has all required content sections");
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
