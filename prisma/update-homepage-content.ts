/**
 * Update homepage with new content schema
 * Run with: npx tsx prisma/update-homepage-content.ts
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

// New homepage content matching component schemas
const homepageContent = {
  hero: {
    badge: "Complete platform",
    badgeHighlight: "Photography-specific, all-in-one",
    titleMuted: "The Business OS for",
    titleMain: "Professional Photographers",
    subtitle: "From booking to delivery to marketing—one platform that handles it all. Operate. Deliver. Get Paid. Grow. Automate.",
    primaryCta: { label: "Start Free", href: "/signup", variant: "primary" },
    secondaryCta: { label: "Take the Tour", href: "#", variant: "outline" },
    socialProof: [
      { id: "1", text: "Replaces 10+ tools" },
      { id: "2", text: "6 photography verticals" },
      { id: "3", text: "AI-powered automation" },
    ],
  },
  logos: {
    stats: [
      { id: "1", value: 10, label: "Tools replaced", suffix: "+" },
      { id: "2", value: 0, label: "Platform fees", suffix: "%" },
      { id: "3", value: 5, label: "Free galleries", suffix: "" },
      { id: "4", value: 24, label: "Hour support", suffix: "/7" },
    ],
    typesLabel: "Built for every photography specialty",
    photographyTypes: [
      { id: "1", name: "Real Estate", icon: "home" },
      { id: "2", name: "Architecture", icon: "building" },
      { id: "3", name: "Commercial", icon: "briefcase" },
      { id: "4", name: "Events", icon: "calendar" },
      { id: "5", name: "Portraits", icon: "user" },
      { id: "6", name: "Food & Product", icon: "camera" },
    ],
    benefits: [
      "No credit card required",
      "Free tier forever",
      "Setup in minutes",
      "Cancel anytime",
    ],
  },
  metrics: {
    label: "Trusted by professionals across every vertical",
    mainValue: 2500,
    mainSuffix: "+",
    mainLabel: "Photographers run their business on PhotoProOS",
    cards: [
      { id: "1", value: "$2.0M+", label: "Monthly Volume", description: "Professional-grade scale", color: "blue" },
      { id: "2", value: "6", label: "Industries", description: "Purpose-built workflows", color: "purple" },
      { id: "3", value: "99.9%", label: "Uptime SLA", description: "Your business, always on", color: "green" },
    ],
  },
  howItWorks: {
    badge: "Simple as",
    badgeHighlight: "1-2-3",
    title: "From shoot to",
    titleHighlight: "payment in minutes",
    subtitle: "No more juggling tools. Upload, price, share—and get paid. It really is that simple.",
    steps: [
      {
        id: "1",
        number: "01",
        title: "Upload & Organize",
        description: "Drag and drop your photos, and PhotoProOS handles the rest. Automatic organization, smart albums, and instant delivery-ready galleries.",
        features: ["Bulk upload support", "Auto-organization", "Smart tagging", "RAW + JPEG support"],
        color: "from-blue-500 to-cyan-500",
      },
      {
        id: "2",
        number: "02",
        title: "Set Pricing & Share",
        description: "Choose free delivery or set your prices. Generate beautiful, branded gallery links to share with clients in seconds.",
        features: ["Custom pricing", "Branded galleries", "Password protection", "Expiration dates"],
        color: "from-purple-500 to-pink-500",
      },
      {
        id: "3",
        number: "03",
        title: "Get Paid & Deliver",
        description: "Clients pay securely, downloads unlock automatically. Track everything from your dashboard—no chasing invoices.",
        features: ["Instant payments", "Auto-delivery", "Payment tracking", "Tax reports"],
        color: "from-green-500 to-emerald-500",
      },
    ],
  },
  testimonials: {
    badge: "Success stories",
    title: "Photographers love PhotoProOS",
    subtitle: "See how photographers across every vertical are growing their business.",
    displayCount: 6,
  },
  pricing: {
    badge: "Simple pricing",
    title: "One platform, transparent pricing",
    subtitle: "No hidden fees. No surprises. Just simple, powerful tools.",
    showComparison: true,
  },
  cta: {
    title: "Ready to transform your",
    titleHighlight: "photography business?",
    subtitle: "Join thousands of photographers who've streamlined their workflow and grown their revenue with PhotoProOS.",
    cta: { label: "Start Free Today", href: "/signup", variant: "primary" },
    secondaryCta: { label: "Schedule Demo", href: "/demo", variant: "outline" },
  },
};

async function main() {
  console.log("🔄 Updating homepage content...\n");

  const result = await prisma.marketingPage.update({
    where: { slug: "homepage" },
    data: {
      content: homepageContent,
      status: "published",
      publishedAt: new Date(),
    },
  });

  console.log("✅ Homepage content updated successfully!");
  console.log(`   Page ID: ${result.id}`);
  console.log(`   Status: ${result.status}`);
}

main()
  .catch((e) => {
    console.error("❌ Error updating homepage:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
