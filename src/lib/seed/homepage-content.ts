"use server";

import { prisma } from "@/lib/db";
import type { HomepageContent } from "@/lib/validations/marketing-cms";

/**
 * Default homepage content - matches the current hardcoded values in section components
 * This content is used to seed the database so users can edit it via the CMS
 */
export const defaultHomepageContent: HomepageContent = {
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

/**
 * Seeds the homepage content to the database
 * Creates or updates the homepage marketing page with default content
 */
export async function seedHomepageContent(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if homepage exists
    const existingPage = await prisma.marketingPage.findUnique({
      where: { slug: "homepage" },
    });

    if (existingPage) {
      // Update existing page with default content if it has no content
      if (!existingPage.content || Object.keys(existingPage.content as object).length === 0) {
        await prisma.marketingPage.update({
          where: { slug: "homepage" },
          data: {
            content: defaultHomepageContent as Record<string, unknown>,
            updatedAt: new Date(),
          },
        });
        return { success: true, message: "Homepage content updated with defaults" };
      }
      return { success: true, message: "Homepage already has content, skipping seed" };
    }

    // Create new homepage
    await prisma.marketingPage.create({
      data: {
        slug: "homepage",
        title: "Homepage",
        pageType: "landing",
        status: "published",
        content: defaultHomepageContent as Record<string, unknown>,
        metaTitle: "PhotoProOS | The Business OS for Professional Photographers",
        metaDescription: "Deliver stunning galleries, collect payments automatically, and run your entire photography business from one platform.",
      },
    });

    return { success: true, message: "Homepage created with default content" };
  } catch (error) {
    console.error("Error seeding homepage content:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Resets homepage content to defaults
 * Use with caution - this will overwrite any existing content
 */
export async function resetHomepageContent(): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.marketingPage.upsert({
      where: { slug: "homepage" },
      create: {
        slug: "homepage",
        title: "Homepage",
        pageType: "landing",
        status: "published",
        content: defaultHomepageContent as Record<string, unknown>,
        metaTitle: "PhotoProOS | The Business OS for Professional Photographers",
        metaDescription: "Deliver stunning galleries, collect payments automatically, and run your entire photography business from one platform.",
      },
      update: {
        content: defaultHomepageContent as Record<string, unknown>,
        updatedAt: new Date(),
      },
    });

    return { success: true, message: "Homepage content reset to defaults" };
  } catch (error) {
    console.error("Error resetting homepage content:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
}
