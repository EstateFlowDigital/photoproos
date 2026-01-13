import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  FeatureRequestCategory,
  FeatureRequestStatus,
} from "@prisma/client";

// Parse the Prisma Postgres URL to get the actual database connection string
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
        const decoded = JSON.parse(
          Buffer.from(apiKey, "base64").toString("utf-8")
        );
        return decoded.databaseUrl;
      } catch (e) {
        console.warn(
          "Could not decode Prisma Postgres API key, using TCP URL"
        );
      }
    }
  }

  return prismaUrl;
}

const connectionString = getDatabaseUrl();
const pool = new Pool({ connectionString, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Feature definitions organized by phase
const roadmapFeatures = {
  // Phase 1: Core Platform (already completed)
  "phase-1": {
    name: "phase-1",
    title: "Core Platform",
    description:
      "Foundation features including galleries, payments, client management, and scheduling.",
    status: "completed",
    order: 1,
    items: [
      {
        name: "Photo Galleries",
        description:
          "Create and share beautiful photo galleries with clients. Includes HD viewing, download options, and favorites.",
        category: "galleries" as FeatureRequestCategory,
        status: "completed" as FeatureRequestStatus,
      },
      {
        name: "Payment Processing",
        description:
          "Accept payments via Stripe with automatic invoicing, payment reminders, and receipt generation.",
        category: "payments" as FeatureRequestCategory,
        status: "completed" as FeatureRequestStatus,
      },
      {
        name: "Client Management",
        description:
          "Comprehensive CRM for managing clients, contacts, and communication history.",
        category: "clients" as FeatureRequestCategory,
        status: "completed" as FeatureRequestStatus,
      },
      {
        name: "Scheduling System",
        description:
          "Book appointments with clients, manage your calendar, and send automated reminders.",
        category: "scheduling" as FeatureRequestCategory,
        status: "completed" as FeatureRequestStatus,
      },
      {
        name: "Project Management",
        description:
          "Track projects from booking to delivery with status updates, timelines, and task management.",
        category: "other" as FeatureRequestCategory,
        status: "completed" as FeatureRequestStatus,
      },
      {
        name: "Contracts & E-Signatures",
        description:
          "Create, send, and track contracts with legally binding e-signatures.",
        category: "other" as FeatureRequestCategory,
        status: "completed" as FeatureRequestStatus,
      },
    ],
  },

  // Phase 2: Client Experience (in progress)
  "phase-2": {
    name: "phase-2",
    title: "Property Websites & Client Portal",
    description:
      "Enhanced client experience with branded portals and property marketing sites.",
    status: "in_progress",
    order: 2,
    items: [
      {
        name: "Property Websites",
        description:
          "Generate beautiful single-property websites for real estate listings with galleries, details, and agent info.",
        category: "marketing" as FeatureRequestCategory,
        status: "in_progress" as FeatureRequestStatus,
      },
      {
        name: "Client Portal",
        description:
          "White-labeled portal where clients can view galleries, sign contracts, pay invoices, and download files.",
        category: "clients" as FeatureRequestCategory,
        status: "in_progress" as FeatureRequestStatus,
      },
      {
        name: "Questionnaires",
        description:
          "Collect pre-shoot information from clients with customizable questionnaire forms.",
        category: "clients" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Matterport Integration",
        description:
          "Embed 3D virtual tours from Matterport into property websites and galleries.",
        category: "integrations" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "AI Image Sorting",
        description:
          "Automatically sort and categorize photos using AI to identify rooms, exteriors, and key features.",
        category: "galleries" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
    ],
  },

  // Phase 3: Marketing Hub
  "phase-3": {
    name: "phase-3",
    title: "Marketing Hub",
    description:
      "Smart file storage, content repurposing, social scheduling, and marketing automations.",
    status: "upcoming",
    order: 3,
    items: [
      {
        name: "Smart File Storage",
        description:
          "Permanent asset management with AI-powered organization, smart search, and cloud storage integration. Includes visual folder interface, Dropbox sync, map view for location browsing, and cache mode for storage optimization.",
        category: "galleries" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "AI Content Repurposing",
        description:
          "Transform one gallery into multiple content pieces. Extract hero shots, create social snippets, and generate marketing materials automatically with AI analysis.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Social Media Scheduler",
        description:
          "Schedule and publish posts to Instagram, Facebook, LinkedIn, and Pinterest. Queue content, optimal timing suggestions, and cross-posting.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Email Campaigns",
        description:
          "Send newsletters, nurture sequences, and promotional campaigns to your client list. Includes templates, analytics, and automation triggers.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "AI Caption Generator",
        description:
          "Generate engaging captions for social media posts. Tailored for Instagram, LinkedIn, and other platforms with hashtag suggestions and tone customization.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Testimonial Automation",
        description:
          "Automatically request, collect, and showcase client testimonials. Integrates with Google Reviews and creates shareable testimonial graphics.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Brand Kit & Templates",
        description:
          "Centralized brand assets with colors, fonts, and logos. Create branded templates for emails, social posts, and marketing materials.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
    ],
  },

  // Phase 4: AI Studio
  "phase-4": {
    name: "phase-4",
    title: "AI Studio",
    description:
      "AI-powered tools to automate editing, staging, and client communication.",
    status: "planned",
    order: 4,
    items: [
      {
        name: "AI Virtual Staging",
        description:
          "Transform empty rooms into staged spaces with AI-generated furniture and decor. Multiple style options including modern, traditional, and minimalist.",
        category: "galleries" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "AI Booking Chatbot",
        description:
          "24/7 chatbot that answers client questions, provides quotes, and books appointments. Learns from your business patterns and pricing.",
        category: "scheduling" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Property Description AI",
        description:
          "Generate compelling property descriptions from photos. Identifies key features, room dimensions, and selling points automatically.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Twilight Converter",
        description:
          "Transform daytime exterior photos into stunning twilight shots using AI sky replacement and lighting enhancement.",
        category: "galleries" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Smart Lead Scoring",
        description:
          "AI-powered lead scoring that predicts which inquiries are most likely to convert. Prioritize high-value leads automatically.",
        category: "clients" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "AI Email Composer",
        description:
          "Draft personalized emails with AI assistance. Suggest responses, follow-ups, and professional communication based on context.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "MLS Auto-Formatter",
        description:
          "Automatically format and resize photos for MLS requirements. Detect orientation issues and ensure compliance with listing standards.",
        category: "integrations" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
    ],
  },

  // Phase 5: Analytics & Intelligence
  "phase-5": {
    name: "phase-5",
    title: "Analytics & Intelligence",
    description:
      "Data-driven insights to grow your business with forecasting and optimization.",
    status: "planned",
    order: 5,
    items: [
      {
        name: "Revenue Forecasting",
        description:
          "Predict future revenue based on historical patterns, bookings pipeline, and seasonal trends. Plan for slow periods and growth opportunities.",
        category: "analytics" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Client Lifetime Value",
        description:
          "Calculate and track the total value of each client relationship. Identify your most valuable clients and nurture them appropriately.",
        category: "analytics" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Smart Workflow Builder",
        description:
          "Create automated workflows with conditional logic. Build custom processes that trigger based on events, time, or client actions.",
        category: "other" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Competitor Insights",
        description:
          "Track competitor pricing, services, and market positioning. Benchmark your performance and identify opportunities.",
        category: "analytics" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "AI Questionnaire Builder",
        description:
          "Smart questionnaire creation that suggests relevant questions based on your photography niche and client type.",
        category: "clients" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Contract AI",
        description:
          "AI-powered contract analysis and generation. Suggest clauses, identify risks, and create customized contracts automatically.",
        category: "other" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
    ],
  },

  // Phase 6: Website Builder
  "phase-6": {
    name: "phase-6",
    title: "Website Builder",
    description:
      "Build your professional photography website with portfolio and blog.",
    status: "planned",
    order: 6,
    items: [
      {
        name: "Portfolio Builder",
        description:
          "Create a stunning portfolio website with customizable templates. Showcase your best work with galleries, categories, and project stories.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "AI Blog Writer",
        description:
          "Generate SEO-optimized blog posts about your work, photography tips, and industry insights. Includes scheduling and content calendar.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "SEO Tools",
        description:
          "Optimize your website for search engines with keyword tracking, meta tag optimization, and performance monitoring.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Custom Domains",
        description:
          "Connect your own domain to your PhotoProOS website. Full SSL, email forwarding, and professional branding.",
        category: "other" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Lead Magnet Generator",
        description:
          "Create downloadable guides, pricing PDFs, and other lead magnets. Capture emails and grow your prospect list.",
        category: "marketing" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
    ],
  },

  // Phase 7: Community & Marketplace
  "phase-7": {
    name: "phase-7",
    title: "Community & Marketplace",
    description:
      "Connect with other photographers, find referrals, and access education.",
    status: "planned",
    order: 7,
    items: [
      {
        name: "Photographer Marketplace",
        description:
          "Find and hire other photographers for overflow work, second shooting, or specialized services. Build your network and grow your business.",
        category: "other" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Vendor Network",
        description:
          "Connect with complementary vendors like stagers, real estate agents, and interior designers. Referral tracking and commission management.",
        category: "other" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Education Hub",
        description:
          "Access courses, tutorials, and resources to improve your photography and business skills. Community-contributed content and expert masterclasses.",
        category: "other" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
      {
        name: "Referral Tracking",
        description:
          "Track referrals between photographers and vendors. Automated commission calculations and transparent reporting.",
        category: "analytics" as FeatureRequestCategory,
        status: "planned" as FeatureRequestStatus,
      },
    ],
  },
};

async function main() {
  console.log("Seeding roadmap features...");

  // Clear existing roadmap data
  console.log("Clearing existing roadmap data...");
  await prisma.roadmapItem.deleteMany();
  await prisma.roadmapPhase.deleteMany();
  // Don't delete feature requests - just update/create them

  for (const [phaseKey, phase] of Object.entries(roadmapFeatures)) {
    console.log(`\nProcessing ${phase.title}...`);

    // Create the roadmap phase
    const roadmapPhase = await prisma.roadmapPhase.create({
      data: {
        name: phase.name,
        title: phase.title,
        description: phase.description,
        status: phase.status,
        order: phase.order,
        isVisible: true,
      },
    });

    console.log(`  Created phase: ${roadmapPhase.title}`);

    // Create feature requests and roadmap items for each item
    for (let i = 0; i < phase.items.length; i++) {
      const item = phase.items[i];

      // Check if feature request already exists
      let featureRequest = await prisma.featureRequest.findFirst({
        where: { title: item.name },
      });

      if (!featureRequest) {
        // Create the feature request
        featureRequest = await prisma.featureRequest.create({
          data: {
            title: item.name,
            description: item.description,
            category: item.category,
            status: item.status,
            roadmapPhase: phase.name,
            submittedByEmail: "system@photoproos.com",
            reviewedAt: new Date(),
          },
        });
        console.log(`    Created feature: ${item.name}`);
      } else {
        // Update existing feature request
        featureRequest = await prisma.featureRequest.update({
          where: { id: featureRequest.id },
          data: {
            description: item.description,
            category: item.category,
            status: item.status,
            roadmapPhase: phase.name,
          },
        });
        console.log(`    Updated feature: ${item.name}`);
      }

      // Create the roadmap item linking to the feature request
      await prisma.roadmapItem.create({
        data: {
          phaseId: roadmapPhase.id,
          name: item.name,
          description: item.description,
          status: item.status,
          order: i,
          featureRequestId: featureRequest.id,
        },
      });
    }
  }

  console.log("\nRoadmap seeding complete!");
  console.log(
    `Created ${Object.keys(roadmapFeatures).length} phases with ${
      Object.values(roadmapFeatures).reduce(
        (acc, phase) => acc + phase.items.length,
        0
      )
    } total features.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
