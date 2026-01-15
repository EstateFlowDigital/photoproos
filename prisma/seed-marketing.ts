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
  // ============================================================================
  // MAIN MARKETING PAGES (17)
  // ============================================================================
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
        { title: "Client Galleries", description: "Beautiful, branded galleries with pay-to-unlock delivery", icon: "images" },
        { title: "Payment Processing", description: "Accept payments and collect deposits automatically", icon: "credit-card" },
        { title: "Client Management", description: "Full CRM to track leads, clients, and projects", icon: "users" },
        { title: "Automated Workflows", description: "Save hours with email sequences and task automation", icon: "zap" },
        { title: "Contracts & Invoicing", description: "Digital contracts with e-signatures and professional invoices", icon: "file-text" },
        { title: "Analytics Dashboard", description: "Track revenue, bookings, and business performance", icon: "bar-chart" },
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
        { title: "Photographers First", description: "Every feature exists because a photographer needed it.", icon: "camera" },
        { title: "Simplicity Over Complexity", description: "Powerful doesn't have to mean complicated.", icon: "sparkles" },
        { title: "Your Data, Your Business", description: "We never sell your data. Your business information stays yours.", icon: "shield" },
        { title: "Speed Matters", description: "Slow software is broken software. We invest heavily in performance.", icon: "rocket" },
        { title: "Support That Cares", description: "Real humans who understand photography answer your questions.", icon: "heart" },
        { title: "Always Improving", description: "We ship updates weekly. Your feedback shapes our roadmap.", icon: "trending-up" },
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
      note: "IMPORTANT: Actual prices are pulled from plan-limits.ts. This CMS content is for features/text only.",
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
    slug: "affiliates",
    title: "Affiliate Program",
    pageType: "custom",
    status: "published",
    content: {
      hero: {
        badge: "Earn With Us",
        headline: "Earn commissions promoting PhotoProOS",
        subheadline: "Join our affiliate program and earn recurring commissions for every photographer you refer.",
      },
      benefits: [
        { title: "30% Commission", description: "Earn 30% recurring commission on all referrals for the first year.", icon: "dollar" },
        { title: "90-Day Cookie", description: "Get credit for referrals up to 90 days after they click your link.", icon: "clock" },
        { title: "Monthly Payouts", description: "Get paid every month via PayPal or bank transfer.", icon: "credit-card" },
        { title: "Marketing Materials", description: "Access banners, email templates, and promotional content.", icon: "image" },
      ],
      requirements: [
        "Active website or social media presence",
        "Photography or creative industry focus",
        "Genuine interest in helping photographers succeed",
      ],
      cta: {
        headline: "Ready to start earning?",
        subheadline: "Apply now and start earning commissions within 24 hours.",
        primaryCTA: { text: "Apply now", href: "/affiliates/apply" },
        secondaryCTA: { text: "Learn more", href: "/affiliates/faq" },
      },
    },
    metaTitle: "Affiliate Program | PhotoProOS",
    metaDescription: "Earn 30% recurring commissions by promoting PhotoProOS to photographers. Join our affiliate program today.",
  },
  {
    slug: "blog",
    title: "Blog",
    pageType: "blog",
    status: "published",
    content: {
      hero: {
        headline: "PhotoProOS Blog",
        subheadline: "Tips, tutorials, and insights for professional photographers.",
      },
      categories: [
        { name: "Tips", slug: "tips", description: "Practical advice for running your photography business" },
        { name: "Tutorials", slug: "tutorials", description: "Step-by-step guides for using PhotoProOS" },
        { name: "Industry News", slug: "industry_insights", description: "Latest trends in professional photography" },
        { name: "Product Updates", slug: "product_updates", description: "New features and improvements" },
        { name: "Case Studies", slug: "case_studies", description: "Success stories from real photographers" },
      ],
    },
    metaTitle: "Blog | PhotoProOS",
    metaDescription: "Tips, tutorials, and insights for professional photographers. Learn how to grow your photography business.",
  },
  {
    slug: "careers",
    title: "Careers",
    pageType: "custom",
    status: "published",
    content: {
      hero: {
        badge: "Join Our Team",
        headline: "Help photographers succeed",
        subheadline: "We're building the future of photography business software. Want to join us?",
      },
      perks: [
        { title: "Remote-First", description: "Work from anywhere in the world.", icon: "globe" },
        { title: "Competitive Pay", description: "Top-of-market salaries and equity.", icon: "dollar" },
        { title: "Health Benefits", description: "Full medical, dental, and vision coverage.", icon: "heart" },
        { title: "Unlimited PTO", description: "Take the time you need to recharge.", icon: "calendar" },
        { title: "Learning Budget", description: "$2,000/year for courses and conferences.", icon: "book" },
        { title: "Equipment Stipend", description: "Get the tools you need to do great work.", icon: "laptop" },
      ],
      values: [
        { title: "Move Fast", description: "We ship weekly and iterate based on feedback." },
        { title: "Be Transparent", description: "Share context, give direct feedback, admit mistakes." },
        { title: "Customer Obsessed", description: "Everything we do starts with photographer needs." },
        { title: "Own It", description: "Take initiative and see things through to completion." },
      ],
      openPositions: [],
      cta: {
        headline: "Don't see a perfect fit?",
        subheadline: "We're always looking for talented people. Send us your resume.",
        primaryCTA: { text: "Send resume", href: "mailto:careers@photoproos.com" },
      },
    },
    metaTitle: "Careers | PhotoProOS",
    metaDescription: "Join the PhotoProOS team. Help us build the future of photography business software.",
  },
  {
    slug: "changelog",
    title: "Changelog",
    pageType: "custom",
    status: "published",
    content: {
      hero: {
        headline: "Changelog",
        subheadline: "See what's new in PhotoProOS. We ship improvements every week.",
      },
      note: "Changelog entries are managed separately in the roadmap system.",
    },
    metaTitle: "Changelog | PhotoProOS",
    metaDescription: "See the latest updates and improvements to PhotoProOS. We ship new features every week.",
  },
  {
    slug: "contact",
    title: "Contact Us",
    pageType: "custom",
    status: "published",
    content: {
      hero: {
        headline: "Get in touch",
        subheadline: "Have a question? We'd love to hear from you.",
      },
      contactOptions: [
        { title: "Sales", description: "Talk to our sales team about enterprise plans.", email: "sales@photoproos.com", icon: "briefcase" },
        { title: "Support", description: "Get help with your account or technical issues.", email: "support@photoproos.com", icon: "help-circle" },
        { title: "Partnerships", description: "Explore partnership opportunities.", email: "partners@photoproos.com", icon: "handshake" },
        { title: "Press", description: "Media inquiries and press requests.", email: "press@photoproos.com", icon: "newspaper" },
      ],
      address: {
        street: "123 Photography Lane",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
        country: "United States",
      },
    },
    metaTitle: "Contact Us | PhotoProOS",
    metaDescription: "Get in touch with the PhotoProOS team. We're here to help with sales, support, and partnerships.",
  },
  {
    slug: "guides",
    title: "Guides",
    pageType: "custom",
    status: "published",
    content: {
      hero: {
        headline: "PhotoProOS Guides",
        subheadline: "In-depth tutorials and best practices for photographers.",
      },
      categories: [
        { name: "Getting Started", description: "New to PhotoProOS? Start here.", icon: "rocket" },
        { name: "Client Management", description: "Organize and nurture client relationships.", icon: "users" },
        { name: "Gallery Best Practices", description: "Create galleries that convert.", icon: "images" },
        { name: "Payment Optimization", description: "Maximize your revenue.", icon: "dollar" },
        { name: "Automation", description: "Save time with workflows.", icon: "zap" },
        { name: "Analytics", description: "Understand your business metrics.", icon: "bar-chart" },
      ],
    },
    metaTitle: "Guides | PhotoProOS",
    metaDescription: "In-depth tutorials and best practices for running your photography business with PhotoProOS.",
  },
  {
    slug: "integrations",
    title: "Integrations",
    pageType: "custom",
    status: "published",
    content: {
      hero: {
        headline: "Integrations",
        subheadline: "Connect PhotoProOS with your favorite tools.",
      },
      integrations: [
        { name: "Stripe", description: "Accept payments and manage subscriptions.", category: "payments", status: "available" },
        { name: "Google Calendar", description: "Sync bookings and appointments.", category: "calendar", status: "available" },
        { name: "Zapier", description: "Connect to 5,000+ apps.", category: "automation", status: "available" },
        { name: "Mailchimp", description: "Sync contacts and send marketing emails.", category: "email", status: "coming_soon" },
        { name: "QuickBooks", description: "Sync invoices and expenses.", category: "accounting", status: "coming_soon" },
        { name: "Lightroom", description: "Import photos directly from Lightroom.", category: "photography", status: "coming_soon" },
      ],
      cta: {
        headline: "Need a custom integration?",
        subheadline: "Our API allows you to build custom integrations for your workflow.",
        primaryCTA: { text: "View API docs", href: "/developers" },
      },
    },
    metaTitle: "Integrations | PhotoProOS",
    metaDescription: "Connect PhotoProOS with Stripe, Google Calendar, Zapier, and more. Streamline your photography workflow.",
  },
  {
    slug: "partners",
    title: "Partners",
    pageType: "custom",
    status: "published",
    content: {
      hero: {
        badge: "Partner With Us",
        headline: "Grow with PhotoProOS",
        subheadline: "Join our partner ecosystem and help photographers succeed.",
      },
      partnerTypes: [
        { title: "Technology Partners", description: "Integrate your product with PhotoProOS.", icon: "code" },
        { title: "Agency Partners", description: "Offer PhotoProOS to your clients.", icon: "building" },
        { title: "Education Partners", description: "Teach photographers with PhotoProOS.", icon: "graduation-cap" },
        { title: "Referral Partners", description: "Earn commissions on referrals.", icon: "users" },
      ],
      benefits: [
        "Co-marketing opportunities",
        "Partner portal access",
        "Dedicated partner manager",
        "Revenue sharing programs",
        "Early access to new features",
      ],
      cta: {
        headline: "Ready to partner?",
        subheadline: "Apply now and our team will be in touch within 48 hours.",
        primaryCTA: { text: "Apply now", href: "/partners/apply" },
      },
    },
    metaTitle: "Partners | PhotoProOS",
    metaDescription: "Join the PhotoProOS partner ecosystem. Technology, agency, education, and referral partnership opportunities.",
  },
  {
    slug: "press",
    title: "Press",
    pageType: "custom",
    status: "published",
    content: {
      hero: {
        headline: "Press & Media",
        subheadline: "Resources for journalists and media professionals.",
      },
      pressKit: {
        description: "Download our press kit for logos, screenshots, and company information.",
        downloadUrl: "/press/press-kit.zip",
      },
      facts: [
        { label: "Founded", value: "2023" },
        { label: "Headquarters", value: "San Francisco, CA" },
        { label: "Photographers", value: "10,000+" },
        { label: "Photos Delivered", value: "2M+" },
      ],
      contactEmail: "press@photoproos.com",
      recentCoverage: [],
    },
    metaTitle: "Press | PhotoProOS",
    metaDescription: "Press resources for PhotoProOS. Download our press kit and contact our media team.",
  },
  {
    slug: "roadmap",
    title: "Roadmap",
    pageType: "custom",
    status: "published",
    content: {
      hero: {
        headline: "Product Roadmap",
        subheadline: "See what we're building and what's coming next.",
      },
      note: "Roadmap items are managed separately in the roadmap system.",
    },
    metaTitle: "Roadmap | PhotoProOS",
    metaDescription: "See what's coming to PhotoProOS. Our public roadmap shows planned features and improvements.",
  },
  {
    slug: "support",
    title: "Support",
    pageType: "custom",
    status: "published",
    content: {
      hero: {
        headline: "How can we help?",
        subheadline: "Find answers, get support, and connect with our team.",
      },
      supportOptions: [
        { title: "Help Center", description: "Browse articles and FAQs.", href: "/support/help-center", icon: "book" },
        { title: "Contact Support", description: "Email our support team.", href: "/contact", icon: "mail" },
        { title: "Community", description: "Connect with other photographers.", href: "/community", icon: "users" },
        { title: "Status", description: "Check system status.", href: "/status", icon: "activity" },
      ],
      popularArticles: [
        { title: "Getting Started with Galleries", href: "/support/getting-started-galleries" },
        { title: "Setting Up Payments", href: "/support/setting-up-payments" },
        { title: "Managing Client Access", href: "/support/managing-client-access" },
        { title: "Workflow Automation", href: "/support/workflow-automation" },
      ],
    },
    metaTitle: "Support | PhotoProOS",
    metaDescription: "Get help with PhotoProOS. Browse our help center, contact support, or join our community.",
  },
  {
    slug: "webinars",
    title: "Webinars",
    pageType: "custom",
    status: "published",
    content: {
      hero: {
        headline: "Webinars & Events",
        subheadline: "Learn from experts and grow your photography business.",
      },
      upcomingWebinars: [],
      pastWebinars: [],
      cta: {
        headline: "Want to be notified about upcoming webinars?",
        subheadline: "Subscribe to get notified when we announce new events.",
        primaryCTA: { text: "Subscribe", href: "/webinars/subscribe" },
      },
    },
    metaTitle: "Webinars | PhotoProOS",
    metaDescription: "Join PhotoProOS webinars to learn tips, best practices, and strategies for your photography business.",
  },

  // ============================================================================
  // FEATURES PAGES (8)
  // ============================================================================
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
        { title: "Customizable Gallery Themes", description: "Choose from multiple professionally designed themes that match your brand aesthetic.", icon: "palette" },
        { title: "Pay-Per-Photo or Gallery Pricing", description: "Set flexible pricing models - charge per photo, per gallery, or offer bundled packages.", icon: "dollar" },
        { title: "Password Protection", description: "Keep galleries private with password protection and expiration dates.", icon: "lock" },
        { title: "Mobile-Optimized Viewing", description: "Galleries look stunning on any device - desktop, tablet, or mobile.", icon: "devices" },
        { title: "Favorites & Selection", description: "Clients can mark favorites and make selections directly in the gallery.", icon: "heart" },
        { title: "Activity Tracking", description: "See when clients view galleries, which photos they like, and download activity.", icon: "chart" },
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
        { title: "Pay-to-Download Galleries", description: "Clients pay before downloading high-resolution photos from their gallery.", icon: "credit-card" },
        { title: "Automated Invoicing", description: "Create and send professional invoices with automatic payment reminders.", icon: "file-text" },
        { title: "Deposit Collection", description: "Collect deposits upfront to secure bookings and reduce no-shows.", icon: "shield" },
        { title: "Multiple Payment Methods", description: "Accept credit cards, debit cards, and ACH transfers.", icon: "wallet" },
        { title: "Payment Plans", description: "Offer payment plans to make larger purchases more accessible.", icon: "calendar" },
        { title: "Automatic Receipts", description: "Clients receive professional receipts automatically after payment.", icon: "receipt" },
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
  {
    slug: "features/clients",
    title: "Client Management",
    pageType: "features",
    status: "published",
    content: {
      hero: {
        badge: "Know Your Clients",
        headline: "Client Management",
        subheadline: "A complete CRM built for photographers. Track leads, manage projects, and nurture relationships.",
      },
      features: [
        { title: "Client Profiles", description: "Store contact info, preferences, and complete history in one place.", icon: "user" },
        { title: "Lead Pipeline", description: "Track leads from inquiry to booking with customizable stages.", icon: "funnel" },
        { title: "Project Management", description: "Organize shoots, track deadlines, and manage deliverables.", icon: "folder" },
        { title: "Communication History", description: "See every email, note, and interaction with each client.", icon: "message-circle" },
        { title: "Tags & Segments", description: "Organize clients with custom tags and smart segments.", icon: "tag" },
        { title: "Client Portal", description: "Give clients their own portal to view projects and files.", icon: "door" },
      ],
      cta: {
        headline: "Ready to organize your client relationships?",
        subheadline: "Start your free trial and import your existing clients in minutes.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Client Management | PhotoProOS Features",
    metaDescription: "A complete CRM built for photographers. Track leads, manage projects, and nurture client relationships.",
  },
  {
    slug: "features/contracts",
    title: "Contracts & Invoices",
    pageType: "features",
    status: "published",
    content: {
      hero: {
        badge: "Protect Your Business",
        headline: "Contracts & Invoices",
        subheadline: "Professional contracts with e-signatures and invoicing that gets you paid on time.",
      },
      features: [
        { title: "Contract Templates", description: "Start with professional templates or create your own.", icon: "file-text" },
        { title: "E-Signatures", description: "Clients can sign contracts online from any device.", icon: "pen" },
        { title: "Professional Invoices", description: "Create branded invoices that reflect your business.", icon: "receipt" },
        { title: "Payment Tracking", description: "Track invoice status and receive payment notifications.", icon: "check-circle" },
        { title: "Automatic Reminders", description: "Send automatic payment reminders for overdue invoices.", icon: "bell" },
        { title: "Tax Reports", description: "Export payment data for easy tax reporting.", icon: "file-spreadsheet" },
      ],
      cta: {
        headline: "Ready to streamline your contracts?",
        subheadline: "Start your free trial and send your first contract today.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Contracts & Invoices | PhotoProOS Features",
    metaDescription: "Professional contracts with e-signatures and invoicing that gets you paid on time.",
  },
  {
    slug: "features/automation",
    title: "Workflow Automation",
    pageType: "features",
    status: "published",
    content: {
      hero: {
        badge: "Save Hours Every Week",
        headline: "Workflow Automation",
        subheadline: "Automate repetitive tasks and never miss a follow-up with powerful workflow automation.",
      },
      features: [
        { title: "Email Sequences", description: "Set up automated email sequences for leads and clients.", icon: "mail" },
        { title: "Task Automation", description: "Create tasks automatically based on project stages.", icon: "check-square" },
        { title: "Triggered Actions", description: "Set up actions that trigger based on client behavior.", icon: "zap" },
        { title: "Follow-up Reminders", description: "Never miss a follow-up with automatic reminders.", icon: "clock" },
        { title: "Workflow Templates", description: "Start with pre-built workflows or create your own.", icon: "template" },
        { title: "Integration Triggers", description: "Connect workflows to your favorite tools via Zapier.", icon: "link" },
      ],
      cta: {
        headline: "Ready to automate your business?",
        subheadline: "Start your free trial and set up your first workflow in minutes.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Workflow Automation | PhotoProOS Features",
    metaDescription: "Automate repetitive tasks and never miss a follow-up with powerful workflow automation.",
  },
  {
    slug: "features/analytics",
    title: "Business Analytics",
    pageType: "features",
    status: "published",
    content: {
      hero: {
        badge: "Data-Driven Decisions",
        headline: "Business Analytics",
        subheadline: "Understand your business with powerful analytics and reporting.",
      },
      features: [
        { title: "Revenue Dashboard", description: "Track revenue, growth, and trends at a glance.", icon: "trending-up" },
        { title: "Booking Analytics", description: "See booking patterns and optimize your availability.", icon: "calendar" },
        { title: "Client Insights", description: "Understand client behavior and identify top customers.", icon: "users" },
        { title: "Gallery Performance", description: "Track gallery views, engagement, and conversion rates.", icon: "eye" },
        { title: "Custom Reports", description: "Build custom reports for the metrics that matter to you.", icon: "file-bar-chart" },
        { title: "Export Data", description: "Export data to Excel or integrate with other tools.", icon: "download" },
      ],
      cta: {
        headline: "Ready to understand your business better?",
        subheadline: "Start your free trial and see your analytics dashboard in minutes.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Business Analytics | PhotoProOS Features",
    metaDescription: "Understand your photography business with powerful analytics and reporting dashboards.",
  },
  {
    slug: "features/social-media",
    title: "Social Media Tools",
    pageType: "features",
    status: "published",
    content: {
      hero: {
        badge: "Grow Your Following",
        headline: "Social Media Tools",
        subheadline: "Share your work and grow your photography business on social media.",
      },
      features: [
        { title: "Share-Ready Galleries", description: "Generate shareable links and embed codes for your galleries.", icon: "share" },
        { title: "Social Proof Widgets", description: "Display testimonials and reviews on your website.", icon: "star" },
        { title: "Client Tagging", description: "Make it easy for clients to tag you when sharing photos.", icon: "at-sign" },
        { title: "Portfolio Showcase", description: "Create a stunning portfolio to share on social media.", icon: "image" },
        { title: "Watermarking", description: "Protect your work with customizable watermarks.", icon: "shield" },
        { title: "Link in Bio", description: "Create a beautiful link page for your social profiles.", icon: "link" },
      ],
      cta: {
        headline: "Ready to grow your social presence?",
        subheadline: "Start your free trial and share your first gallery today.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Social Media Tools | PhotoProOS Features",
    metaDescription: "Share your photography work and grow your business on social media with PhotoProOS.",
  },
  {
    slug: "features/email-marketing",
    title: "Email Marketing",
    pageType: "features",
    status: "published",
    content: {
      hero: {
        badge: "Stay Connected",
        headline: "Email Marketing",
        subheadline: "Nurture leads and stay connected with clients through beautiful email campaigns.",
      },
      features: [
        { title: "Email Templates", description: "Start with beautiful templates designed for photographers.", icon: "mail" },
        { title: "Drag-and-Drop Editor", description: "Create stunning emails without any coding.", icon: "move" },
        { title: "Automated Campaigns", description: "Set up drip campaigns that run on autopilot.", icon: "zap" },
        { title: "Segmentation", description: "Target the right clients with smart segments.", icon: "users" },
        { title: "Open & Click Tracking", description: "See who opens your emails and what they click.", icon: "eye" },
        { title: "A/B Testing", description: "Test subject lines and content to improve results.", icon: "split" },
      ],
      cta: {
        headline: "Ready to connect with your clients?",
        subheadline: "Start your free trial and send your first campaign today.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Email Marketing | PhotoProOS Features",
    metaDescription: "Nurture leads and stay connected with clients through beautiful email campaigns.",
  },

  // ============================================================================
  // INDUSTRIES PAGES (6)
  // ============================================================================
  {
    slug: "industries/real-estate",
    title: "Real Estate Photography",
    pageType: "industries",
    status: "published",
    content: {
      hero: {
        badge: "For Real Estate Photographers",
        headline: "Built for Real Estate Photography",
        subheadline: "Deliver property photos fast, get paid automatically, and scale your real estate photography business.",
      },
      features: [
        { title: "Fast Turnaround", description: "Deliver galleries to agents within 24 hours.", icon: "clock" },
        { title: "Agent Portal", description: "Give agents their own portal to access all their listings.", icon: "door" },
        { title: "MLS-Ready Downloads", description: "Export photos in MLS-compliant formats.", icon: "download" },
        { title: "Volume Pricing", description: "Set up pricing tiers for high-volume clients.", icon: "layers" },
        { title: "Automated Invoicing", description: "Invoice agents automatically after delivery.", icon: "file-text" },
        { title: "Scheduling", description: "Let agents book shoots directly on your calendar.", icon: "calendar" },
      ],
      testimonial: {
        quote: "PhotoProOS cut my admin time in half. I can focus on shooting instead of chasing payments.",
        author: "David Chen",
        role: "Real Estate Photographer",
        company: "Premier Property Photos",
      },
      cta: {
        headline: "Ready to scale your real estate photography?",
        subheadline: "Join thousands of real estate photographers using PhotoProOS.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Real Estate Photography Software | PhotoProOS",
    metaDescription: "The best software for real estate photographers. Deliver galleries fast, get paid automatically, and scale your business.",
  },
  {
    slug: "industries/commercial",
    title: "Commercial Photography",
    pageType: "industries",
    status: "published",
    content: {
      hero: {
        badge: "For Commercial Photographers",
        headline: "Built for Commercial Photography",
        subheadline: "Manage complex projects, deliver to multiple stakeholders, and handle enterprise clients with ease.",
      },
      features: [
        { title: "Project Management", description: "Track complex shoots with multiple deliverables.", icon: "folder" },
        { title: "Multi-User Access", description: "Give different team members appropriate access.", icon: "users" },
        { title: "Usage Rights Tracking", description: "Track license agreements and usage rights.", icon: "file-check" },
        { title: "Enterprise Billing", description: "Handle POs, NET terms, and complex billing.", icon: "building" },
        { title: "Asset Management", description: "Organize and search your commercial archive.", icon: "database" },
        { title: "Client Approvals", description: "Get sign-off on selections and final deliverables.", icon: "check-square" },
      ],
      cta: {
        headline: "Ready to professionalize your commercial work?",
        subheadline: "Join commercial photographers who trust PhotoProOS.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Commercial Photography Software | PhotoProOS",
    metaDescription: "Software for commercial photographers. Manage complex projects and deliver to enterprise clients.",
  },
  {
    slug: "industries/architecture",
    title: "Architecture Photography",
    pageType: "industries",
    status: "published",
    content: {
      hero: {
        badge: "For Architecture Photographers",
        headline: "Built for Architecture Photography",
        subheadline: "Showcase architectural work beautifully and manage relationships with architects and designers.",
      },
      features: [
        { title: "Portfolio Galleries", description: "Display your architectural work in stunning galleries.", icon: "image" },
        { title: "Client Collaboration", description: "Work with architects on selections and edits.", icon: "users" },
        { title: "Project Documentation", description: "Organize photos by project, location, and date.", icon: "folder" },
        { title: "Publication Rights", description: "Track publication and usage rights.", icon: "book" },
        { title: "High-Res Delivery", description: "Deliver print-ready files to publications.", icon: "download" },
        { title: "Referral Tracking", description: "Track which projects come from which referrals.", icon: "git-branch" },
      ],
      cta: {
        headline: "Ready to showcase your architectural work?",
        subheadline: "Join architecture photographers using PhotoProOS.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Architecture Photography Software | PhotoProOS",
    metaDescription: "Software for architecture photographers. Showcase your work and manage client relationships.",
  },
  {
    slug: "industries/events",
    title: "Event Photography",
    pageType: "industries",
    status: "published",
    content: {
      hero: {
        badge: "For Event Photographers",
        headline: "Built for Event Photography",
        subheadline: "Deliver event galleries, sell prints, and manage high-volume photography with ease.",
      },
      features: [
        { title: "Bulk Upload", description: "Upload thousands of photos quickly.", icon: "upload" },
        { title: "Face Recognition", description: "Help guests find their photos with AI.", icon: "user-check" },
        { title: "Print Sales", description: "Sell prints and digital downloads directly.", icon: "shopping-cart" },
        { title: "QR Code Sharing", description: "Guests can access galleries via QR codes.", icon: "qr-code" },
        { title: "Fast Delivery", description: "Deliver same-day or next-day galleries.", icon: "zap" },
        { title: "Attendee Access", description: "Control who can view and purchase photos.", icon: "lock" },
      ],
      cta: {
        headline: "Ready to level up your event photography?",
        subheadline: "Join event photographers using PhotoProOS.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Event Photography Software | PhotoProOS",
    metaDescription: "Software for event photographers. Deliver galleries fast and sell prints to attendees.",
  },
  {
    slug: "industries/portraits",
    title: "Portrait Photography",
    pageType: "industries",
    status: "published",
    content: {
      hero: {
        badge: "For Portrait Photographers",
        headline: "Built for Portrait Photography",
        subheadline: "Create beautiful portrait galleries and streamline your portrait photography business.",
      },
      features: [
        { title: "Session Galleries", description: "Beautiful galleries for portrait sessions.", icon: "image" },
        { title: "Online Booking", description: "Let clients book sessions on your website.", icon: "calendar" },
        { title: "Print Lab Integration", description: "Send orders directly to print labs.", icon: "printer" },
        { title: "Package Pricing", description: "Sell portrait packages with multiple products.", icon: "package" },
        { title: "Client Favorites", description: "Let clients select their favorite photos.", icon: "heart" },
        { title: "Family Accounts", description: "Group family members for easy organization.", icon: "users" },
      ],
      cta: {
        headline: "Ready to grow your portrait business?",
        subheadline: "Join portrait photographers using PhotoProOS.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Portrait Photography Software | PhotoProOS",
    metaDescription: "Software for portrait photographers. Beautiful galleries, online booking, and print sales.",
  },
  {
    slug: "industries/food",
    title: "Food Photography",
    pageType: "industries",
    status: "published",
    content: {
      hero: {
        badge: "For Food Photographers",
        headline: "Built for Food Photography",
        subheadline: "Deliver mouth-watering food photography and manage restaurant and brand clients.",
      },
      features: [
        { title: "Menu Galleries", description: "Organize photos by dish, category, or menu.", icon: "utensils" },
        { title: "Brand Portals", description: "Give brands access to their complete photo library.", icon: "building" },
        { title: "Asset Licensing", description: "Track usage rights and license agreements.", icon: "file-check" },
        { title: "Retouching Delivery", description: "Deliver raw and retouched versions.", icon: "wand" },
        { title: "Seasonal Updates", description: "Manage seasonal menu photo updates.", icon: "calendar" },
        { title: "Social Media Exports", description: "Export photos sized for social media.", icon: "share" },
      ],
      cta: {
        headline: "Ready to serve up stunning food photos?",
        subheadline: "Join food photographers using PhotoProOS.",
        primaryCTA: { text: "Start free trial", href: "/sign-up" },
        secondaryCTA: { text: "View pricing", href: "/pricing" },
      },
    },
    metaTitle: "Food Photography Software | PhotoProOS",
    metaDescription: "Software for food photographers. Deliver delicious galleries and manage restaurant clients.",
  },

  // ============================================================================
  // LEGAL PAGES (5)
  // ============================================================================
  {
    slug: "legal/terms",
    title: "Terms of Service",
    pageType: "legal",
    status: "published",
    content: {
      title: "Terms of Service",
      lastUpdated: "2024-01-01",
      sections: [
        {
          title: "1. Acceptance of Terms",
          content: "By accessing or using PhotoProOS, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
        },
        {
          title: "2. Description of Service",
          content: "PhotoProOS provides a platform for photographers to manage their business, including client galleries, payment processing, and client management tools.",
        },
        {
          title: "3. User Accounts",
          content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
        },
        {
          title: "4. Acceptable Use",
          content: "You agree to use PhotoProOS only for lawful purposes and in accordance with these Terms. You may not use the service to upload illegal content or violate others' rights.",
        },
        {
          title: "5. Intellectual Property",
          content: "You retain ownership of all content you upload to PhotoProOS. We do not claim ownership of your photos or client data.",
        },
        {
          title: "6. Payment Terms",
          content: "Paid plans are billed in advance. You authorize us to charge your payment method for all fees incurred.",
        },
        {
          title: "7. Termination",
          content: "You may cancel your account at any time. We may terminate your account for violations of these terms.",
        },
        {
          title: "8. Limitation of Liability",
          content: "PhotoProOS is provided 'as is' without warranties. We are not liable for indirect, incidental, or consequential damages.",
        },
        {
          title: "9. Changes to Terms",
          content: "We may update these terms from time to time. Continued use of the service constitutes acceptance of changes.",
        },
        {
          title: "10. Contact",
          content: "Questions about these terms can be sent to legal@photoproos.com.",
        },
      ],
    },
    metaTitle: "Terms of Service | PhotoProOS",
    metaDescription: "Read the PhotoProOS Terms of Service. Understand your rights and responsibilities when using our platform.",
  },
  {
    slug: "legal/privacy",
    title: "Privacy Policy",
    pageType: "legal",
    status: "published",
    content: {
      title: "Privacy Policy",
      lastUpdated: "2024-01-01",
      sections: [
        {
          title: "1. Information We Collect",
          content: "We collect information you provide directly (name, email, payment info) and information collected automatically (usage data, cookies).",
        },
        {
          title: "2. How We Use Your Information",
          content: "We use your information to provide and improve our services, process payments, communicate with you, and ensure security.",
        },
        {
          title: "3. Information Sharing",
          content: "We do not sell your personal information. We share data only with service providers necessary to operate our platform.",
        },
        {
          title: "4. Data Security",
          content: "We implement industry-standard security measures including encryption, secure servers, and regular security audits.",
        },
        {
          title: "5. Your Rights",
          content: "You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.",
        },
        {
          title: "6. Data Retention",
          content: "We retain your data for as long as your account is active or as needed to provide services and comply with legal obligations.",
        },
        {
          title: "7. International Transfers",
          content: "Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.",
        },
        {
          title: "8. Children's Privacy",
          content: "PhotoProOS is not intended for children under 16. We do not knowingly collect data from children.",
        },
        {
          title: "9. Changes to Privacy Policy",
          content: "We may update this policy from time to time. We will notify you of significant changes.",
        },
        {
          title: "10. Contact",
          content: "Questions about privacy can be sent to privacy@photoproos.com.",
        },
      ],
    },
    metaTitle: "Privacy Policy | PhotoProOS",
    metaDescription: "Read the PhotoProOS Privacy Policy. Learn how we collect, use, and protect your data.",
  },
  {
    slug: "legal/cookies",
    title: "Cookie Policy",
    pageType: "legal",
    status: "published",
    content: {
      title: "Cookie Policy",
      lastUpdated: "2024-01-01",
      sections: [
        {
          title: "What Are Cookies",
          content: "Cookies are small text files stored on your device when you visit our website. They help us provide a better experience.",
        },
        {
          title: "Types of Cookies We Use",
          content: "We use essential cookies (required for the site to function), analytics cookies (to understand usage), and preference cookies (to remember your settings).",
        },
        {
          title: "Managing Cookies",
          content: "You can control cookies through your browser settings. Note that disabling cookies may affect site functionality.",
        },
        {
          title: "Third-Party Cookies",
          content: "We use third-party services (like analytics) that may set their own cookies. Please refer to their privacy policies.",
        },
      ],
    },
    metaTitle: "Cookie Policy | PhotoProOS",
    metaDescription: "Read the PhotoProOS Cookie Policy. Learn about the cookies we use and how to manage them.",
  },
  {
    slug: "legal/security",
    title: "Security",
    pageType: "legal",
    status: "published",
    content: {
      title: "Security",
      lastUpdated: "2024-01-01",
      sections: [
        {
          title: "Our Security Commitment",
          content: "We take the security of your data seriously. We implement industry-standard measures to protect your information.",
        },
        {
          title: "Encryption",
          content: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.",
        },
        {
          title: "Infrastructure",
          content: "Our services run on secure cloud infrastructure with regular security audits and penetration testing.",
        },
        {
          title: "Access Control",
          content: "We use role-based access control and require multi-factor authentication for all employee access.",
        },
        {
          title: "Compliance",
          content: "We are SOC 2 Type II compliant and regularly undergo third-party security assessments.",
        },
        {
          title: "Vulnerability Disclosure",
          content: "We maintain a responsible disclosure program. Report security issues to security@photoproos.com.",
        },
      ],
    },
    metaTitle: "Security | PhotoProOS",
    metaDescription: "Learn about PhotoProOS security practices. How we protect your data and maintain compliance.",
  },
  {
    slug: "legal/dpa",
    title: "Data Processing Agreement",
    pageType: "legal",
    status: "published",
    content: {
      title: "Data Processing Agreement",
      lastUpdated: "2024-01-01",
      sections: [
        {
          title: "1. Definitions",
          content: "This DPA defines the terms under which PhotoProOS processes personal data on behalf of customers.",
        },
        {
          title: "2. Scope",
          content: "This agreement applies to all personal data processed by PhotoProOS in connection with the services provided.",
        },
        {
          title: "3. Data Processing",
          content: "We process data only as instructed by you and in accordance with applicable data protection laws.",
        },
        {
          title: "4. Sub-processors",
          content: "We use sub-processors to provide certain services. A list of sub-processors is available upon request.",
        },
        {
          title: "5. Data Subject Rights",
          content: "We assist you in responding to data subject requests for access, correction, or deletion.",
        },
        {
          title: "6. Security Measures",
          content: "We implement appropriate technical and organizational measures to protect personal data.",
        },
        {
          title: "7. Data Breach Notification",
          content: "We will notify you of any data breach affecting your data within 72 hours of becoming aware.",
        },
        {
          title: "8. Audit Rights",
          content: "You have the right to audit our data processing practices with reasonable notice.",
        },
      ],
    },
    metaTitle: "Data Processing Agreement | PhotoProOS",
    metaDescription: "Read the PhotoProOS Data Processing Agreement for GDPR compliance and data protection.",
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
    featuredImg: null,
    authorName: "PhotoProOS Team",
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
    featuredImg: null,
    authorName: "Sarah Williams",
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
    category: "industry_insights",
    status: "published",
    publishedAt: new Date("2024-02-15"),
    featuredImg: null,
    authorName: "Alex Chen",
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
    imageUrl: null,
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
    imageUrl: null,
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
    imageUrl: null,
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
    imageUrl: null,
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
    authorRole: "Wedding Photographer",
    companyName: "JM Photography",
    authorImage: null,
    rating: 5,
    targetIndustry: "events",
    isVisible: true,
    sortOrder: 1,
  },
  {
    quote: "The client galleries are stunning, and my clients love how easy it is to view and purchase photos. My sales have increased 40% since switching.",
    authorName: "David Chen",
    authorRole: "Real Estate Photographer",
    companyName: "Premier Property Photos",
    authorImage: null,
    rating: 5,
    targetIndustry: "real_estate",
    isVisible: true,
    sortOrder: 2,
  },
  {
    quote: "Finally, a platform built by photographers who understand our needs. The workflow automation alone saves me 10 hours a week.",
    authorName: "Rachel Thompson",
    authorRole: "Portrait Photographer",
    companyName: "Thompson Portraits",
    authorImage: null,
    rating: 5,
    targetIndustry: "headshots",
    isVisible: true,
    sortOrder: 3,
  },
  {
    quote: "I was skeptical at first, but the ROI was immediate. The payment processing integration is seamless and my clients love it.",
    authorName: "Michael Foster",
    authorRole: "Commercial Photographer",
    companyName: "Foster Creative",
    authorImage: null,
    rating: 5,
    targetIndustry: "commercial",
    isVisible: true,
    sortOrder: 4,
  },
  {
    quote: "As an architecture photographer, I need my galleries to look professional. PhotoProOS delivers exactly that.",
    authorName: "Lisa Park",
    authorRole: "Architecture Photographer",
    companyName: "LP Architectural",
    authorImage: null,
    rating: 5,
    targetIndustry: "architecture",
    isVisible: true,
    sortOrder: 5,
  },
];

// ============================================================================
// FAQS DATA
// ============================================================================

const faqs = [
  // Pricing FAQs (show on pricing page)
  {
    question: "Can I try PhotoProOS before committing?",
    answer: "Yes! Our Free plan is available forever, and Pro comes with a 14-day free trial. No credit card required.",
    category: "pricing",
    targetPages: ["pricing", "homepage"],
    sortOrder: 1,
    isVisible: true,
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards through Stripe. Annual plans receive a 20% discount.",
    category: "pricing",
    targetPages: ["pricing"],
    sortOrder: 2,
    isVisible: true,
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Absolutely. You can change your plan at any time. Upgrades take effect immediately, and downgrades at the end of your billing cycle.",
    category: "pricing",
    targetPages: ["pricing"],
    sortOrder: 3,
    isVisible: true,
  },
  {
    question: "What are the payment processing fees?",
    answer: "We charge a small percentage on payments you collect through galleries. The fee decreases as your plan tier increases: 2.9% + 30¢ for Pro, 2.5% + 30¢ for Studio, and custom rates for Enterprise.",
    category: "pricing",
    targetPages: ["pricing", "features/payments"],
    sortOrder: 4,
    isVisible: true,
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes! Annual plans save you 20% compared to monthly billing.",
    category: "pricing",
    targetPages: ["pricing"],
    sortOrder: 5,
    isVisible: true,
  },
  // General FAQs (show on homepage and support)
  {
    question: "How do client galleries work?",
    answer: "Upload your photos to create a gallery, set your pricing, and share the link with your client. They can view previews, select favorites, and purchase high-resolution downloads.",
    category: "general",
    targetPages: ["homepage", "support", "features/galleries"],
    sortOrder: 1,
    isVisible: true,
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use bank-level encryption, secure data centers, and follow industry best practices. Your photos and client data are always protected.",
    category: "general",
    targetPages: ["homepage", "support", "legal/security"],
    sortOrder: 2,
    isVisible: true,
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes! Pro and higher plans can connect a custom domain for their client portal and galleries.",
    category: "general",
    targetPages: ["homepage", "pricing", "support"],
    sortOrder: 3,
    isVisible: true,
  },
  // Features FAQs (show on features pages)
  {
    question: "What integrations are available?",
    answer: "PhotoProOS integrates with Stripe for payments, Google Calendar for scheduling, and more. We're constantly adding new integrations based on user feedback.",
    category: "features",
    targetPages: ["integrations", "features/automation", "support"],
    sortOrder: 1,
    isVisible: true,
  },
  {
    question: "Can I automate my workflows?",
    answer: "Yes! Create automated email sequences, task reminders, and follow-up workflows to save time and never miss a step.",
    category: "features",
    targetPages: ["features/automation", "homepage"],
    sortOrder: 2,
    isVisible: true,
  },
  // Technical FAQs (show on support and technical pages)
  {
    question: "What file formats are supported?",
    answer: "We support JPEG, PNG, and TIFF formats. Files can be up to 100MB each, with batch upload support for faster workflow.",
    category: "technical",
    targetPages: ["support", "features/galleries"],
    sortOrder: 1,
    isVisible: true,
  },
  {
    question: "Is there an API?",
    answer: "Yes! Studio and Enterprise plans include API access for custom integrations and automation.",
    category: "technical",
    targetPages: ["support", "pricing", "integrations"],
    sortOrder: 2,
    isVisible: true,
  },
  // Getting Started FAQs
  {
    question: "How long does it take to set up?",
    answer: "Most photographers are up and running in under 30 minutes. Our onboarding wizard guides you through the essential setup steps.",
    category: "getting_started",
    targetPages: ["homepage", "support", "pricing"],
    sortOrder: 1,
    isVisible: true,
  },
  {
    question: "Can I import my existing clients?",
    answer: "Yes! You can import clients from a CSV file or connect your existing tools. We'll help migrate your data.",
    category: "getting_started",
    targetPages: ["support", "features/clients"],
    sortOrder: 2,
    isVisible: true,
  },
  // Billing FAQs
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel anytime from your account settings. Your access continues until the end of your billing period.",
    category: "billing",
    targetPages: ["support", "pricing"],
    sortOrder: 1,
    isVisible: true,
  },
  {
    question: "What happens to my data if I cancel?",
    answer: "You have 30 days after cancellation to export your data. After that, your data is permanently deleted from our servers.",
    category: "billing",
    targetPages: ["support", "legal/privacy"],
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
        category: post.category as "tutorials" | "tips" | "news" | "case_studies" | "product_updates" | "industry_insights",
        status: post.status as "draft" | "published" | "archived",
        publishedAt: post.publishedAt,
        featuredImg: post.featuredImg,
        authorName: post.authorName,
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
        imageUrl: member.imageUrl,
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
        authorRole: testimonial.authorRole,
        companyName: testimonial.companyName,
        authorImage: testimonial.authorImage,
        rating: testimonial.rating,
        targetIndustry: testimonial.targetIndustry as "real_estate" | "commercial" | "architecture" | "events" | "headshots" | "food" | "general",
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
        category: faq.category as "general" | "pricing" | "features" | "technical" | "billing" | "getting_started",
        targetPages: faq.targetPages || [],
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
