/**
 * Seed script for marketing CMS content
 * Run with: npx tsx prisma/seed-marketing.ts
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

// ============================================================================
// MARKETING PAGES DATA
// ============================================================================

const marketingPages = [
  {
    slug: "homepage",
    title: "Homepage",
    pageType: "homepage",
    status: "published",
    content: {
      hero: {
        badge: "The Business OS for Photographers",
        headline: "Run your photography business from one powerful platform",
        subheadline: "Deliver stunning galleries, collect payments automatically, and grow your business with PhotoProOS.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "Watch demo", href: "#demo" },
      },
      stats: [
        { value: "10,000+", label: "Photographers" },
        { value: "2M+", label: "Photos Delivered" },
        { value: "$50M+", label: "Payments Processed" },
        { value: "99.9%", label: "Uptime" },
      ],
      features: [
        {
          title: "Client Galleries",
          description: "Beautiful, branded galleries with pay-to-unlock delivery",
          icon: "images",
        },
        {
          title: "Payment Processing",
          description: "Accept payments and collect deposits automatically",
          icon: "credit-card",
        },
        {
          title: "Client Management",
          description: "Full CRM to track leads, clients, and projects",
          icon: "users",
        },
        {
          title: "Automated Workflows",
          description: "Save hours with email sequences and task automation",
          icon: "zap",
        },
        {
          title: "Contracts & Invoicing",
          description: "Digital contracts with e-signatures and professional invoices",
          icon: "file-text",
        },
        {
          title: "Analytics Dashboard",
          description: "Track revenue, bookings, and business performance",
          icon: "bar-chart",
        },
      ],
      cta: {
        headline: "Ready to streamline your photography business?",
        subheadline: "Start free today. No credit card required.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "Contact sales", href: "/contact" },
      },
    },
    metaTitle: "PhotoProOS - The Business OS for Professional Photographers",
    metaDescription: "Run your photography business from one platform. Client galleries, payment processing, CRM, contracts, and analytics.",
  },
  {
    slug: "about",
    title: "About Us",
    pageType: "about",
    status: "published",
    content: {
      hero: {
        badge: "Our Story",
        headline: "Built by photographers, for photographers",
        subheadline: "We know the challenges of running a photography business because we've lived them.",
      },
      mission: {
        title: "Our Mission",
        paragraphs: [
          "Professional photographers deserve professional tools. Not cobbled-together solutions from five different apps.",
          "Our mission is simple: give every professional photographer the same operational advantage that large studios have.",
        ],
      },
      stats: [
        { value: "10k+", label: "Photographers" },
        { value: "2M+", label: "Photos Delivered" },
        { value: "$50M+", label: "Payments Processed" },
        { value: "99.9%", label: "Uptime" },
      ],
      story: {
        title: "How It Started",
        paragraphs: [
          "It was 2 AM after a long wedding shoot. The photos were edited, but the real work was just beginning.",
          "We were using seven different tools to run one business. There had to be a better way. So we built it.",
          "PhotoProOS started as an internal tool. When other photographers saw it, they wanted in.",
        ],
      },
      values: [
        {
          title: "Photographers First",
          description: "Every feature exists because a photographer needed it.",
          icon: "camera",
        },
        {
          title: "Simplicity Over Complexity",
          description: "Powerful doesn't have to mean complicated.",
          icon: "sparkles",
        },
        {
          title: "Your Data, Your Business",
          description: "We never sell your data. Your business information stays yours.",
          icon: "shield",
        },
        {
          title: "Speed Matters",
          description: "Slow software is broken software. We invest heavily in performance.",
          icon: "rocket",
        },
        {
          title: "Support That Cares",
          description: "Real humans who understand photography answer your questions.",
          icon: "heart",
        },
        {
          title: "Always Improving",
          description: "We ship updates weekly. Your feedback shapes our roadmap.",
          icon: "trending-up",
        },
      ],
      cta: {
        headline: "Join thousands of photographers",
        subheadline: "See why photographers are switching to PhotoProOS.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "Contact sales", href: "/contact" },
      },
    },
    metaTitle: "About | PhotoProOS",
    metaDescription: "Learn about PhotoProOS - the business operating system built by photographers, for photographers.",
  },
  {
    slug: "pricing",
    title: "Pricing",
    pageType: "pricing",
    status: "published",
    content: {
      hero: {
        badge: "Simple, transparent pricing",
        headline: "Start free, upgrade anytime",
        subheadline: "No hidden fees, no surprises. Start free, upgrade when you're ready.",
      },
      plans: [
        {
          name: "Free",
          description: "Perfect for getting started and trying out PhotoProOS.",
          monthlyPrice: 0,
          annualPrice: 0,
          features: [
            "Up to 5 active galleries",
            "Basic gallery themes",
            "Client portal access",
            "Email support",
            "PhotoProOS branding",
          ],
          cta: "Get started free",
          highlighted: false,
        },
        {
          name: "Pro",
          description: "For professional photographers ready to grow their business.",
          monthlyPrice: 29,
          annualPrice: 23,
          features: [
            "Unlimited galleries",
            "Custom branding",
            "Payment processing",
            "Automated workflows",
            "Priority email support",
            "Client management CRM",
            "Analytics dashboard",
          ],
          cta: "Start free trial",
          highlighted: true,
          badge: "Most Popular",
        },
        {
          name: "Studio",
          description: "For busy studios and photography teams.",
          monthlyPrice: 79,
          annualPrice: 63,
          features: [
            "Everything in Pro",
            "Team collaboration (up to 5)",
            "Advanced analytics",
            "Custom contracts",
            "Priority phone support",
            "White-label client portal",
            "API access",
            "Dedicated account manager",
          ],
          cta: "Start free trial",
          highlighted: false,
        },
        {
          name: "Enterprise",
          description: "For large organizations with custom requirements.",
          monthlyPrice: null,
          annualPrice: null,
          features: [
            "Everything in Studio",
            "Unlimited team members",
            "Custom integrations",
            "SLA guarantee",
            "Dedicated infrastructure",
            "Onboarding & training",
            "Custom feature development",
          ],
          cta: "Contact sales",
          highlighted: false,
        },
      ],
      comparison: [
        { feature: "Active galleries", free: "5", pro: "Unlimited", studio: "Unlimited", enterprise: "Unlimited" },
        { feature: "Storage", free: "2 GB", pro: "100 GB", studio: "500 GB", enterprise: "Unlimited" },
        { feature: "Custom branding", free: false, pro: true, studio: true, enterprise: true },
        { feature: "Payment processing", free: false, pro: true, studio: true, enterprise: true },
        { feature: "Team members", free: "1", pro: "1", studio: "5", enterprise: "Unlimited" },
        { feature: "API access", free: false, pro: false, studio: true, enterprise: true },
      ],
      cta: {
        headline: "Ready to streamline your photography business?",
        subheadline: "Start free today. No credit card required.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "Contact sales", href: "/contact" },
      },
    },
    metaTitle: "Pricing | PhotoProOS",
    metaDescription: "Simple, transparent pricing for photographers of all sizes. Start free, upgrade when you're ready.",
  },
  {
    slug: "features/galleries",
    title: "Client Galleries",
    pageType: "features",
    status: "published",
    content: {
      hero: {
        badge: "Most Popular Feature",
        headline: "Client Galleries",
        subheadline: "Create beautiful, branded galleries that impress clients and drive sales with pay-to-unlock photo delivery.",
      },
      features: [
        {
          title: "Customizable Gallery Themes",
          description: "Choose from multiple professionally designed themes that match your brand aesthetic.",
          icon: "palette",
        },
        {
          title: "Pay-Per-Photo or Gallery Pricing",
          description: "Set flexible pricing models - charge per photo, per gallery, or offer bundled packages.",
          icon: "dollar",
        },
        {
          title: "Password Protection",
          description: "Keep galleries private with password protection and expiration dates.",
          icon: "lock",
        },
        {
          title: "Mobile-Optimized Viewing",
          description: "Galleries look stunning on any device - desktop, tablet, or mobile.",
          icon: "devices",
        },
        {
          title: "Favorites & Selection",
          description: "Clients can mark favorites and make selections directly in the gallery.",
          icon: "heart",
        },
        {
          title: "Activity Tracking",
          description: "See when clients view galleries, which photos they like, and download activity.",
          icon: "chart",
        },
      ],
      cta: {
        headline: "Ready to deliver stunning galleries?",
        subheadline: "Start your free trial and create your first gallery in minutes.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Client Galleries | PhotoProOS Features",
    metaDescription: "Create beautiful, branded galleries that impress clients and drive sales with pay-to-unlock photo delivery.",
  },
  {
    slug: "features/payments",
    title: "Payment Processing",
    pageType: "features",
    status: "published",
    content: {
      hero: {
        badge: "Get Paid Faster",
        headline: "Payment Processing",
        subheadline: "Accept payments, collect deposits, and automate your billing with integrated payment processing.",
      },
      features: [
        {
          title: "Pay-to-Download Galleries",
          description: "Clients pay before downloading high-resolution photos from their gallery.",
          icon: "credit-card",
        },
        {
          title: "Automated Invoicing",
          description: "Create and send professional invoices with automatic payment reminders.",
          icon: "file-text",
        },
        {
          title: "Deposit Collection",
          description: "Collect deposits upfront to secure bookings and reduce no-shows.",
          icon: "shield",
        },
        {
          title: "Multiple Payment Methods",
          description: "Accept credit cards, debit cards, and ACH transfers.",
          icon: "wallet",
        },
      ],
      cta: {
        headline: "Start getting paid faster",
        subheadline: "Set up payment processing in minutes with our Stripe integration.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Payment Processing | PhotoProOS Features",
    metaDescription: "Accept payments, collect deposits, and automate your billing with integrated payment processing.",
  },
];

// ============================================================================
// BLOG POSTS DATA
// ============================================================================

const blogPosts = [
  {
    slug: "getting-started-with-photoproos",
    title: "Getting Started with PhotoProOS: A Complete Guide",
    excerpt: "Learn how to set up your PhotoProOS account and start managing your photography business more efficiently.",
    content: `
# Getting Started with PhotoProOS

Welcome to PhotoProOS! This guide will walk you through setting up your account and getting the most out of our platform.

## Step 1: Create Your Organization

After signing up, the first thing you'll do is create your organization. This is where all your business data will live.

## Step 2: Add Your Branding

Customize your client portal with your logo, colors, and brand identity to create a cohesive experience for your clients.

## Step 3: Create Your First Gallery

Upload photos, set your pricing, and share the gallery link with your client. It's that simple!

## Step 4: Set Up Payments

Connect your Stripe account to start accepting payments directly through your galleries.

## Need Help?

Our support team is here to help! Reach out anytime at support@photoproos.com.
    `.trim(),
    category: "tutorials",
    status: "published",
    publishedAt: new Date("2024-01-15"),
    featuredImage: null,
    author: "PhotoProOS Team",
  },
  {
    slug: "5-ways-to-increase-gallery-sales",
    title: "5 Ways to Increase Your Gallery Sales",
    excerpt: "Proven strategies to help photographers maximize revenue from client galleries.",
    content: `
# 5 Ways to Increase Your Gallery Sales

Every photographer wants to earn more from their galleries. Here are five proven strategies to boost your sales.

## 1. Use High-Quality Preview Images

Your previews should be stunning enough to make clients want the full resolution versions.

## 2. Offer Package Deals

Create bundles that encourage clients to purchase more photos at a slight discount.

## 3. Add Urgency with Expiration Dates

Set gallery expiration dates to create urgency and encourage faster purchasing decisions.

## 4. Follow Up Personally

A quick personal email or message can remind clients about their gallery and answer any questions.

## 5. Make Purchasing Easy

The fewer clicks to purchase, the better. PhotoProOS makes checkout seamless for your clients.
    `.trim(),
    category: "tips",
    status: "published",
    publishedAt: new Date("2024-02-01"),
    featuredImage: null,
    author: "Sarah Williams",
  },
  {
    slug: "client-experience-matters",
    title: "Why Client Experience Matters More Than Ever",
    excerpt: "In a competitive photography market, delivering an exceptional client experience is your secret weapon.",
    content: `
# Why Client Experience Matters More Than Ever

In today's photography market, technical skill is table stakes. What sets successful photographers apart is the experience they deliver.

## The Modern Client

Today's clients expect:
- Instant access to their photos
- Mobile-friendly galleries
- Easy payment options
- Clear communication

## How PhotoProOS Helps

Our platform is designed around client experience, from beautiful galleries to seamless payments.

## The Results

Photographers using PhotoProOS report higher client satisfaction and more referrals.
    `.trim(),
    category: "business",
    status: "published",
    publishedAt: new Date("2024-02-15"),
    featuredImage: null,
    author: "Alex Chen",
  },
];

// ============================================================================
// TEAM MEMBERS DATA
// ============================================================================

const teamMembers = [
  {
    name: "Alex Chen",
    role: "Founder & CEO",
    bio: "Former wedding photographer turned software founder. Still shoots occasionally.",
    image: null,
    linkedIn: "https://linkedin.com/in/alexchen",
    twitter: "https://twitter.com/alexchen",
    website: null,
    sortOrder: 1,
    isVisible: true,
  },
  {
    name: "Sarah Williams",
    role: "Head of Product",
    bio: "10+ years in real estate photography. Knows every pain point firsthand.",
    image: null,
    linkedIn: "https://linkedin.com/in/sarahwilliams",
    twitter: null,
    website: null,
    sortOrder: 2,
    isVisible: true,
  },
  {
    name: "Marcus Johnson",
    role: "Lead Engineer",
    bio: "Built systems at scale. Obsessed with fast, reliable software.",
    image: null,
    linkedIn: "https://linkedin.com/in/marcusjohnson",
    twitter: "https://twitter.com/marcusj",
    website: "https://marcusjohnson.dev",
    sortOrder: 3,
    isVisible: true,
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Customer Success",
    bio: "Former studio manager. Helps photographers get the most from PhotoProOS.",
    image: null,
    linkedIn: "https://linkedin.com/in/emilyrodriguez",
    twitter: null,
    website: null,
    sortOrder: 4,
    isVisible: true,
  },
];

// ============================================================================
// TESTIMONIALS DATA
// ============================================================================

const testimonials = [
  {
    quote: "PhotoProOS transformed how I run my wedding photography business. I used to spend hours on admin work - now it's all automated.",
    authorName: "Jennifer Martinez",
    authorTitle: "Wedding Photographer",
    authorCompany: "JM Photography",
    authorImage: null,
    rating: 5,
    industry: "events",
    isVisible: true,
    sortOrder: 1,
  },
  {
    quote: "The client galleries are stunning, and my clients love how easy it is to view and purchase photos. My sales have increased 40% since switching.",
    authorName: "David Chen",
    authorTitle: "Real Estate Photographer",
    authorCompany: "Premier Property Photos",
    authorImage: null,
    rating: 5,
    industry: "real_estate",
    isVisible: true,
    sortOrder: 2,
  },
  {
    quote: "Finally, a platform built by photographers who understand our needs. The workflow automation alone saves me 10 hours a week.",
    authorName: "Rachel Thompson",
    authorTitle: "Portrait Photographer",
    authorCompany: "Thompson Portraits",
    authorImage: null,
    rating: 5,
    industry: "portraits",
    isVisible: true,
    sortOrder: 3,
  },
  {
    quote: "I was skeptical at first, but the ROI was immediate. The payment processing integration is seamless and my clients love it.",
    authorName: "Michael Foster",
    authorTitle: "Commercial Photographer",
    authorCompany: "Foster Creative",
    authorImage: null,
    rating: 5,
    industry: "commercial",
    isVisible: true,
    sortOrder: 4,
  },
  {
    quote: "As an architecture photographer, I need my galleries to look professional. PhotoProOS delivers exactly that.",
    authorName: "Lisa Park",
    authorTitle: "Architecture Photographer",
    authorCompany: "LP Architectural",
    authorImage: null,
    rating: 5,
    industry: "architecture",
    isVisible: true,
    sortOrder: 5,
  },
];

// ============================================================================
// FAQS DATA
// ============================================================================

const faqs = [
  // Pricing FAQs
  {
    question: "Can I try PhotoProOS before committing?",
    answer: "Yes! Our Free plan is available forever, and Pro comes with a 14-day free trial. No credit card required.",
    category: "pricing",
    sortOrder: 1,
    isVisible: true,
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards through Stripe. Annual plans receive a 20% discount.",
    category: "pricing",
    sortOrder: 2,
    isVisible: true,
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Absolutely. You can change your plan at any time. Upgrades take effect immediately, and downgrades at the end of your billing cycle.",
    category: "pricing",
    sortOrder: 3,
    isVisible: true,
  },
  {
    question: "What are the payment processing fees?",
    answer: "We charge a small percentage on payments you collect through galleries. The fee decreases as your plan tier increases: 2.9% + 30¢ for Pro, 2.5% + 30¢ for Studio, and custom rates for Enterprise.",
    category: "pricing",
    sortOrder: 4,
    isVisible: true,
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes! Annual plans save you 20% compared to monthly billing.",
    category: "pricing",
    sortOrder: 5,
    isVisible: true,
  },
  // General FAQs
  {
    question: "How do client galleries work?",
    answer: "Upload your photos to create a gallery, set your pricing, and share the link with your client. They can view previews, select favorites, and purchase high-resolution downloads.",
    category: "general",
    sortOrder: 1,
    isVisible: true,
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use bank-level encryption, secure data centers, and follow industry best practices. Your photos and client data are always protected.",
    category: "general",
    sortOrder: 2,
    isVisible: true,
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes! Pro and higher plans can connect a custom domain for their client portal and galleries.",
    category: "general",
    sortOrder: 3,
    isVisible: true,
  },
  // Features FAQs
  {
    question: "What integrations are available?",
    answer: "PhotoProOS integrates with Stripe for payments, Google Calendar for scheduling, and more. We're constantly adding new integrations based on user feedback.",
    category: "features",
    sortOrder: 1,
    isVisible: true,
  },
  {
    question: "Can I automate my workflows?",
    answer: "Yes! Create automated email sequences, task reminders, and follow-up workflows to save time and never miss a step.",
    category: "features",
    sortOrder: 2,
    isVisible: true,
  },
  // Technical FAQs
  {
    question: "What file formats are supported?",
    answer: "We support JPEG, PNG, and TIFF formats. Files can be up to 100MB each, with batch upload support for faster workflow.",
    category: "technical",
    sortOrder: 1,
    isVisible: true,
  },
  {
    question: "Is there an API?",
    answer: "Yes! Studio and Enterprise plans include API access for custom integrations and automation.",
    category: "technical",
    sortOrder: 2,
    isVisible: true,
  },
];

// ============================================================================
// NAVIGATION DATA
// ============================================================================

const navigation = {
  navbar: {
    logo: {
      text: "PhotoProOS",
      href: "/",
    },
    links: [
      {
        label: "Features",
        href: "/features/galleries",
        children: [
          { label: "Client Galleries", href: "/features/galleries" },
          { label: "Payment Processing", href: "/features/payments" },
          { label: "Client Management", href: "/features/clients" },
          { label: "Contracts", href: "/features/contracts" },
          { label: "Automation", href: "/features/automation" },
          { label: "Analytics", href: "/features/analytics" },
        ],
      },
      {
        label: "Industries",
        href: "/industries/real-estate",
        children: [
          { label: "Real Estate", href: "/industries/real-estate" },
          { label: "Commercial", href: "/industries/commercial" },
          { label: "Architecture", href: "/industries/architecture" },
          { label: "Events", href: "/industries/events" },
          { label: "Portraits", href: "/industries/portraits" },
          { label: "Food", href: "/industries/food" },
        ],
      },
      { label: "Pricing", href: "/pricing" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/about" },
    ],
    cta: {
      text: "Start free trial",
      href: "/sign-up",
    },
  },
  footer: {
    logo: {
      text: "PhotoProOS",
      href: "/",
    },
    tagline: "The Business OS for Professional Photographers",
    columns: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "/features/galleries" },
          { label: "Pricing", href: "/pricing" },
          { label: "Integrations", href: "/integrations" },
          { label: "Changelog", href: "/changelog" },
          { label: "Roadmap", href: "/roadmap" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Blog", href: "/blog" },
          { label: "Careers", href: "/careers" },
          { label: "Press", href: "/press" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Support", href: "/support" },
          { label: "Guides", href: "/guides" },
          { label: "Webinars", href: "/webinars" },
          { label: "Partners", href: "/partners" },
          { label: "Affiliates", href: "/affiliates" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy", href: "/legal/privacy" },
          { label: "Terms", href: "/legal/terms" },
          { label: "Cookies", href: "/legal/cookies" },
          { label: "Security", href: "/legal/security" },
          { label: "DPA", href: "/legal/dpa" },
        ],
      },
    ],
    social: [
      { platform: "twitter", href: "https://twitter.com/photoproos" },
      { platform: "instagram", href: "https://instagram.com/photoproos" },
      { platform: "linkedin", href: "https://linkedin.com/company/photoproos" },
      { platform: "youtube", href: "https://youtube.com/@photoproos" },
    ],
    copyright: "PhotoProOS. All rights reserved.",
  },
};

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log("📦 Seeding marketing content...\n");

  // Clear existing data
  console.log("🗑️  Clearing existing marketing data...");
  await prisma.fAQ.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.marketingNavigation.deleteMany();
  await prisma.marketingPage.deleteMany();

  // Seed Marketing Pages
  console.log("📄 Seeding marketing pages...");
  for (const page of marketingPages) {
    await prisma.marketingPage.create({
      data: {
        slug: page.slug,
        title: page.title,
        pageType: page.pageType as "homepage" | "about" | "pricing" | "features" | "industries" | "legal" | "blog" | "custom",
        status: page.status as "draft" | "published" | "archived",
        content: page.content,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
      },
    });
  }
  console.log(`   ✅ Created ${marketingPages.length} marketing pages`);

  // Seed Navigation
  console.log("🧭 Seeding navigation...");
  await prisma.marketingNavigation.create({
    data: {
      location: "navbar",
      content: navigation.navbar,
    },
  });
  await prisma.marketingNavigation.create({
    data: {
      location: "footer",
      content: navigation.footer,
    },
  });
  console.log("   ✅ Created navbar and footer navigation");

  // Seed Blog Posts
  console.log("📰 Seeding blog posts...");
  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category as "tutorials" | "tips" | "news" | "case_studies" | "industry" | "business",
        status: post.status as "draft" | "published" | "archived",
        publishedAt: post.publishedAt,
        featuredImage: post.featuredImage,
        author: post.author,
      },
    });
  }
  console.log(`   ✅ Created ${blogPosts.length} blog posts`);

  // Seed Team Members
  console.log("👥 Seeding team members...");
  for (const member of teamMembers) {
    await prisma.teamMember.create({
      data: {
        name: member.name,
        role: member.role,
        bio: member.bio,
        image: member.image,
        linkedIn: member.linkedIn,
        twitter: member.twitter,
        website: member.website,
        sortOrder: member.sortOrder,
        isVisible: member.isVisible,
      },
    });
  }
  console.log(`   ✅ Created ${teamMembers.length} team members`);

  // Seed Testimonials
  console.log("💬 Seeding testimonials...");
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: {
        quote: testimonial.quote,
        authorName: testimonial.authorName,
        authorTitle: testimonial.authorTitle,
        authorCompany: testimonial.authorCompany,
        authorImage: testimonial.authorImage,
        rating: testimonial.rating,
        industry: testimonial.industry as "real_estate" | "commercial" | "architecture" | "events" | "portraits" | "food" | "general",
        isVisible: testimonial.isVisible,
        sortOrder: testimonial.sortOrder,
      },
    });
  }
  console.log(`   ✅ Created ${testimonials.length} testimonials`);

  // Seed FAQs
  console.log("❓ Seeding FAQs...");
  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category as "general" | "pricing" | "features" | "technical" | "billing" | "support",
        sortOrder: faq.sortOrder,
        isVisible: faq.isVisible,
      },
    });
  }
  console.log(`   ✅ Created ${faqs.length} FAQs`);

  console.log("\n🎉 Marketing content seeded successfully!");
  console.log(`
Summary:
  - ${marketingPages.length} marketing pages
  - 2 navigation items (navbar + footer)
  - ${blogPosts.length} blog posts
  - ${teamMembers.length} team members
  - ${testimonials.length} testimonials
  - ${faqs.length} FAQs
  `);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding marketing content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
