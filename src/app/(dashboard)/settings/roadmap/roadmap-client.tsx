"use client";

import { useState, useCallback, useId } from "react";
import Link from "next/link";
import {
  RocketIcon,
  CalendarIcon,
  SparklesIcon,
  PlugIcon,
  MessageIcon,
  LayersIcon,
  PlusIcon,
  XIcon,
  CheckIcon,
  GlobeIcon,
  UsersIcon,
  CreditCardIcon,
  MailIcon,
  CameraIcon,
  CodeIcon,
} from "@/components/ui/settings-icons";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type FeatureCategory =
  | "website"
  | "marketing"
  | "social"
  | "crm"
  | "communication"
  | "workflow"
  | "galleries"
  | "finance"
  | "team"
  | "integrations"
  | "ai"
  | "analytics";

type FeatureStatus = "in_progress" | "planned" | "exploring";
type FeatureTier = "core" | "growth" | "enterprise";

interface RoadmapFeature {
  id: string;
  title: string;
  description: string;
  category: FeatureCategory;
  status: FeatureStatus;
  tier: FeatureTier;
  timeline?: string;
  learnMoreUrl?: string;
}

interface FeatureRequestFormData {
  title: string;
  description: string;
  category: FeatureCategory | "";
}

// ============================================================================
// Data - Comprehensive Business OS Roadmap
// ============================================================================

const ROADMAP_FEATURES: RoadmapFeature[] = [
  // ============================================================================
  // WEBSITE BUILDER & HOSTING
  // ============================================================================
  {
    id: "website-builder",
    title: "Website Builder",
    description:
      "Drag-and-drop website builder with professional templates designed for photographers. Create stunning portfolio sites without coding.",
    category: "website",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "custom-domain",
    title: "Custom Domain Hosting",
    description:
      "Connect your own domain (yourname.com) with SSL certificates, DNS management, and email forwarding included.",
    category: "website",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "blog-cms",
    title: "Blog & Content Management",
    description:
      "Built-in blog system with rich text editor, image optimization, categories, tags, and scheduled publishing.",
    category: "website",
    status: "planned",
    tier: "core",
    timeline: "Q3 2026",
  },
  {
    id: "service-areas",
    title: "Service Area Pages",
    description:
      "Auto-generated SEO-optimized pages for each city/area you serve. Rank locally and attract nearby clients.",
    category: "website",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "seo-toolkit",
    title: "SEO Toolkit",
    description:
      "Built-in SEO tools including meta tags, sitemaps, schema markup, page speed optimization, and keyword tracking.",
    category: "website",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "landing-pages",
    title: "Landing Page Builder",
    description:
      "Create high-converting landing pages for promotions, mini sessions, and special offers with A/B testing.",
    category: "website",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "website-analytics",
    title: "Website Analytics",
    description:
      "Track visitors, page views, traffic sources, and conversions without needing Google Analytics.",
    category: "website",
    status: "planned",
    tier: "core",
    timeline: "Q3 2026",
  },

  // ============================================================================
  // SOCIAL MEDIA MANAGEMENT
  // ============================================================================
  {
    id: "social-scheduler",
    title: "Social Media Scheduler",
    description:
      "Schedule posts to Instagram, Facebook, Pinterest, and LinkedIn. Visual calendar with drag-and-drop scheduling.",
    category: "social",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
    learnMoreUrl: "/features/social-media",
  },
  {
    id: "social-templates",
    title: "Social Media Templates",
    description:
      "Library of customizable templates for Instagram stories, reels covers, carousel posts, and more. Match your brand.",
    category: "social",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "social-analytics",
    title: "Social Analytics Dashboard",
    description:
      "Track engagement, follower growth, best posting times, and content performance across all platforms.",
    category: "social",
    status: "planned",
    tier: "growth",
    timeline: "Q4 2026",
  },
  {
    id: "content-calendar",
    title: "Content Calendar",
    description:
      "Plan your content strategy with a unified calendar showing blog posts, social media, emails, and campaigns.",
    category: "social",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "hashtag-manager",
    title: "Hashtag Manager",
    description:
      "Save hashtag sets, track performance, and get AI-suggested hashtags based on your content and niche.",
    category: "social",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "auto-posting",
    title: "Auto-Post Gallery Highlights",
    description:
      "Automatically create and schedule social posts when you deliver a gallery. Share your best work effortlessly.",
    category: "social",
    status: "exploring",
    tier: "growth",
  },

  // ============================================================================
  // EMAIL MARKETING
  // ============================================================================
  {
    id: "email-campaigns",
    title: "Email Campaign Builder",
    description:
      "Drag-and-drop email designer with templates for newsletters, promotions, and announcements. No coding required.",
    category: "marketing",
    status: "planned",
    tier: "growth",
    timeline: "Q2 2026",
    learnMoreUrl: "/features/email-marketing",
  },
  {
    id: "email-automation",
    title: "Email Automation Sequences",
    description:
      "Set up automated drip campaigns for lead nurturing, onboarding, post-session follow-ups, and re-engagement.",
    category: "marketing",
    status: "planned",
    tier: "growth",
    timeline: "Q2 2026",
  },
  {
    id: "email-templates",
    title: "Email Template Library",
    description:
      "Pre-built email templates for common scenarios: booking confirmations, session reminders, thank you notes, and more.",
    category: "marketing",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "email-analytics",
    title: "Email Analytics",
    description:
      "Track opens, clicks, bounces, and conversions. See which emails drive bookings and revenue.",
    category: "marketing",
    status: "planned",
    tier: "growth",
    timeline: "Q2 2026",
  },
  {
    id: "list-segmentation",
    title: "Audience Segmentation",
    description:
      "Segment your contacts by client type, booking history, location, or custom tags for targeted messaging.",
    category: "marketing",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },

  // ============================================================================
  // CRM & CLIENT MANAGEMENT
  // ============================================================================
  {
    id: "crm-pipeline",
    title: "Sales Pipeline",
    description:
      "Visual pipeline to track leads from inquiry to booking. Drag-and-drop stages, automated follow-ups, and win/loss tracking.",
    category: "crm",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "lead-capture",
    title: "Lead Capture Forms",
    description:
      "Embeddable contact forms for your website with custom fields, file uploads, and instant notifications.",
    category: "crm",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "client-portal-v2",
    title: "Enhanced Client Portal",
    description:
      "Redesigned client portal with personalized dashboard, project timeline, document storage, and communication hub.",
    category: "crm",
    status: "in_progress",
    tier: "core",
    timeline: "Q1 2026",
  },
  {
    id: "client-lifecycle",
    title: "Client Lifecycle Tracking",
    description:
      "See the complete history with each client: bookings, payments, communications, and lifetime value.",
    category: "crm",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "referral-tracking",
    title: "Referral Program",
    description:
      "Track who referred whom, automate thank-you gifts, and reward your best promoters with credits or commissions.",
    category: "crm",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "testimonial-collection",
    title: "Testimonial Collection",
    description:
      "Automatically request and collect testimonials via video, photo, or text. Showcase on your website.",
    category: "crm",
    status: "exploring",
    tier: "growth",
  },

  // ============================================================================
  // COMMUNICATION HUB
  // ============================================================================
  {
    id: "unified-inbox",
    title: "Unified Inbox",
    description:
      "All your emails, texts, and in-app messages in one place. Never miss a client message again.",
    category: "communication",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "sms-marketing",
    title: "SMS Marketing",
    description:
      "Send text message campaigns, appointment reminders, and promotional offers with high open rates.",
    category: "communication",
    status: "planned",
    tier: "growth",
    timeline: "Q2 2026",
  },
  {
    id: "client-chat-v2",
    title: "Enhanced Client Chat",
    description:
      "Real-time chat with typing indicators, read receipts, file sharing, and threaded conversations.",
    category: "communication",
    status: "in_progress",
    tier: "core",
    timeline: "Q1 2026",
  },
  {
    id: "video-messaging",
    title: "Video Messaging",
    description:
      "Record and send personalized video messages to clients. Stand out with a personal touch.",
    category: "communication",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "voicemail-drop",
    title: "Voicemail Drop",
    description:
      "Leave pre-recorded voicemails directly to client phones without calling. Perfect for reminders.",
    category: "communication",
    status: "exploring",
    tier: "enterprise",
  },
  {
    id: "whatsapp-integration",
    title: "WhatsApp Business",
    description:
      "Connect WhatsApp Business for international clients. Templates, automation, and full conversation history.",
    category: "communication",
    status: "exploring",
    tier: "enterprise",
  },

  // ============================================================================
  // WORKFLOW & AUTOMATION
  // ============================================================================
  {
    id: "workflow-automation",
    title: "Workflow Automation",
    description:
      "Build custom automations: when X happens, do Y. Automate emails, tasks, status changes, and notifications.",
    category: "workflow",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "task-templates",
    title: "Project Task Templates",
    description:
      "Create reusable task lists for different shoot types. Auto-assign tasks when projects are created.",
    category: "workflow",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "advanced-scheduling",
    title: "Advanced Scheduling",
    description:
      "Multi-day shoots, buffer times, travel time calculations, and team availability management.",
    category: "workflow",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "online-booking",
    title: "Online Booking System",
    description:
      "Let clients book sessions directly from your website. Choose available times, packages, and pay deposits.",
    category: "workflow",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "quote-proposals",
    title: "Quote & Proposal Builder",
    description:
      "Create beautiful, branded proposals with pricing options, expiration dates, and e-signature acceptance.",
    category: "workflow",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "mobile-app",
    title: "Native Mobile App",
    description:
      "iOS and Android apps for managing your business on the go. Offline mode for on-location work.",
    category: "workflow",
    status: "planned",
    tier: "core",
    timeline: "Q4 2026",
  },

  // ============================================================================
  // GALLERIES & DELIVERY
  // ============================================================================
  {
    id: "ai-culling",
    title: "AI Photo Culling",
    description:
      "Use AI to automatically identify and select the best shots. Save hours of manual culling work.",
    category: "galleries",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "client-selections",
    title: "Client Selection Galleries",
    description:
      "Let clients pick their favorite photos with voting, hearts, and comments. Export selections easily.",
    category: "galleries",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "album-proofing",
    title: "Album Proofing",
    description:
      "Drag-and-drop album designer with client approval workflow. Integrates with print labs.",
    category: "galleries",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "print-fulfillment",
    title: "Print Fulfillment",
    description:
      "Partner integrations with print labs. Offer wall art, albums, and prints directly from galleries.",
    category: "galleries",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "batch-editing",
    title: "Batch Operations",
    description:
      "Apply watermarks, resize, rename, and organize hundreds of photos at once.",
    category: "galleries",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "slideshow-builder",
    title: "Slideshow Builder",
    description:
      "Create beautiful video slideshows from gallery photos with music, transitions, and branding.",
    category: "galleries",
    status: "exploring",
    tier: "growth",
  },

  // ============================================================================
  // FINANCE & PAYMENTS
  // ============================================================================
  {
    id: "recurring-invoices",
    title: "Recurring Invoices",
    description:
      "Set up automatic monthly or quarterly billing for retainer clients and ongoing services.",
    category: "finance",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "multi-currency",
    title: "Multi-Currency Support",
    description:
      "Accept payments in multiple currencies with automatic conversion and localized pricing.",
    category: "finance",
    status: "planned",
    tier: "enterprise",
    timeline: "Q4 2026",
  },
  {
    id: "tax-reports",
    title: "Tax Preparation Reports",
    description:
      "Export income, expenses, and mileage in formats ready for your accountant or tax software.",
    category: "finance",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "profit-dashboard",
    title: "Profit & Loss Dashboard",
    description:
      "Real-time P&L statements, cash flow tracking, and profitability analysis per project or client.",
    category: "finance",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "payment-plans",
    title: "Flexible Payment Plans",
    description:
      "Offer clients custom payment schedules with automatic payment collection and reminders.",
    category: "finance",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "commission-tracking",
    title: "Commission Tracking",
    description:
      "Track commissions owed to agents, referrers, and partners. Automate payout calculations.",
    category: "finance",
    status: "exploring",
    tier: "growth",
  },

  // ============================================================================
  // TEAM & OPERATIONS
  // ============================================================================
  {
    id: "team-scheduling",
    title: "Team Scheduling",
    description:
      "Manage availability, assign shoots, and track capacity across your team. Avoid double-bookings.",
    category: "team",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "contractor-portal",
    title: "Contractor Portal",
    description:
      "Self-service portal for contractors to view assignments, submit invoices, and track payments.",
    category: "team",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "time-tracking",
    title: "Time Tracking",
    description:
      "Track time spent on editing, shoots, and admin work. Analyze where your time goes.",
    category: "team",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "performance-metrics",
    title: "Team Performance Metrics",
    description:
      "Track photographer ratings, delivery times, and client satisfaction scores.",
    category: "team",
    status: "exploring",
    tier: "enterprise",
  },
  {
    id: "training-library",
    title: "Training Resource Library",
    description:
      "Upload training videos, SOPs, and guides for onboarding new team members.",
    category: "team",
    status: "exploring",
    tier: "enterprise",
  },

  // ============================================================================
  // INTEGRATIONS
  // ============================================================================
  {
    id: "google-drive",
    title: "Google Drive Sync",
    description:
      "Automatically sync galleries and backups to Google Drive. Never lose a photo.",
    category: "integrations",
    status: "in_progress",
    tier: "core",
    timeline: "Q1 2026",
  },
  {
    id: "lightroom-plugin",
    title: "Adobe Lightroom Plugin",
    description:
      "Export directly from Lightroom to PhotoProOS. Sync edits and metadata seamlessly.",
    category: "integrations",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "capture-one",
    title: "Capture One Integration",
    description:
      "Native integration for Capture One users. Export sessions directly to galleries.",
    category: "integrations",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "quickbooks-sync",
    title: "QuickBooks Sync",
    description:
      "Two-way sync with QuickBooks for invoices, payments, and expense tracking.",
    category: "integrations",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "slack-notifications",
    title: "Slack Notifications",
    description:
      "Get instant Slack notifications for bookings, payments, gallery views, and client messages.",
    category: "integrations",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "zapier-integration",
    title: "Zapier Integration",
    description:
      "Connect PhotoProOS to 5,000+ apps. Build custom automations without code.",
    category: "integrations",
    status: "planned",
    tier: "growth",
    timeline: "Q4 2026",
  },
  {
    id: "api-access",
    title: "Public API",
    description:
      "RESTful API for custom integrations, data export, and building on top of PhotoProOS.",
    category: "integrations",
    status: "planned",
    tier: "enterprise",
    timeline: "Q4 2026",
  },
  {
    id: "platform-migration",
    title: "Platform Migration Tools",
    description:
      "One-click import from Pic-Time, ShootProof, Pixieset, and Zenfolio. Bring your data with you.",
    category: "integrations",
    status: "exploring",
    tier: "core",
  },

  // ============================================================================
  // AI & AUTOMATION
  // ============================================================================
  {
    id: "ai-assistant",
    title: "AI Business Assistant",
    description:
      "Ask questions about your business in natural language. Get insights, reports, and recommendations.",
    category: "ai",
    status: "exploring",
    tier: "enterprise",
  },
  {
    id: "ai-content-writer",
    title: "AI Content Writer",
    description:
      "Generate blog posts, social captions, and email copy with AI. Match your brand voice.",
    category: "ai",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "ai-image-tagging",
    title: "AI Image Tagging",
    description:
      "Automatically tag photos by content (bride, groom, venue, details) for easy searching.",
    category: "ai",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "smart-scheduling",
    title: "Smart Scheduling",
    description:
      "AI suggests optimal shoot times based on client preferences, team availability, and location.",
    category: "ai",
    status: "exploring",
    tier: "enterprise",
  },
  {
    id: "predictive-analytics",
    title: "Predictive Revenue Forecasting",
    description:
      "AI-powered forecasts based on your pipeline, seasonality, and historical data.",
    category: "ai",
    status: "exploring",
    tier: "enterprise",
  },

  // ============================================================================
  // ANALYTICS & INSIGHTS
  // ============================================================================
  {
    id: "business-dashboard",
    title: "Business Intelligence Dashboard",
    description:
      "Customizable dashboard with KPIs, charts, and real-time metrics. See your business at a glance.",
    category: "analytics",
    status: "planned",
    tier: "core",
    timeline: "Q3 2026",
  },
  {
    id: "client-insights",
    title: "Client Insights",
    description:
      "Understand your clients: average booking value, repeat rate, acquisition channels, and lifetime value.",
    category: "analytics",
    status: "planned",
    tier: "growth",
    timeline: "Q3 2026",
  },
  {
    id: "revenue-reports",
    title: "Revenue Reports",
    description:
      "Detailed revenue breakdowns by service, client type, month, and team member.",
    category: "analytics",
    status: "planned",
    tier: "core",
    timeline: "Q2 2026",
  },
  {
    id: "marketing-attribution",
    title: "Marketing Attribution",
    description:
      "Track which marketing channels drive bookings. See ROI on ads, social, referrals, and more.",
    category: "analytics",
    status: "exploring",
    tier: "growth",
  },
  {
    id: "benchmark-reports",
    title: "Industry Benchmarks",
    description:
      "Compare your metrics to industry averages. See how you stack up against similar businesses.",
    category: "analytics",
    status: "exploring",
    tier: "enterprise",
  },
];

// ============================================================================
// Category Configuration
// ============================================================================

const CATEGORIES: Record<
  FeatureCategory,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  website: {
    label: "Website & Hosting",
    description: "Your professional online presence",
    icon: GlobeIcon,
    color: "var(--primary)",
  },
  social: {
    label: "Social Media",
    description: "Manage all your social platforms",
    icon: SparklesIcon,
    color: "#E1306C", // Instagram pink
  },
  marketing: {
    label: "Email Marketing",
    description: "Campaigns, automation, and newsletters",
    icon: MailIcon,
    color: "var(--ai)",
  },
  crm: {
    label: "CRM & Clients",
    description: "Manage leads and client relationships",
    icon: UsersIcon,
    color: "#10B981", // Emerald
  },
  communication: {
    label: "Communication Hub",
    description: "Email, SMS, chat, and calls",
    icon: MessageIcon,
    color: "var(--success)",
  },
  workflow: {
    label: "Workflow & Booking",
    description: "Scheduling, tasks, and automation",
    icon: LayersIcon,
    color: "var(--warning)",
  },
  galleries: {
    label: "Galleries & Delivery",
    description: "Photo delivery and client proofing",
    icon: CameraIcon,
    color: "#8B5CF6", // Violet
  },
  finance: {
    label: "Finance & Payments",
    description: "Invoicing, payments, and accounting",
    icon: CreditCardIcon,
    color: "#06B6D4", // Cyan
  },
  team: {
    label: "Team & Operations",
    description: "Manage your team and contractors",
    icon: UsersIcon,
    color: "#F59E0B", // Amber
  },
  integrations: {
    label: "Integrations",
    description: "Connect your favorite tools",
    icon: PlugIcon,
    color: "#6366F1", // Indigo
  },
  ai: {
    label: "AI & Automation",
    description: "Smart features powered by AI",
    icon: SparklesIcon,
    color: "#EC4899", // Pink
  },
  analytics: {
    label: "Analytics & Insights",
    description: "Data-driven business decisions",
    icon: SparklesIcon,
    color: "var(--error)",
  },
};

const STATUS_CONFIG: Record<
  FeatureStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  in_progress: {
    label: "In Progress",
    bg: "bg-[var(--success)]/10",
    text: "text-[var(--success)]",
    border: "border-[var(--success)]/30",
  },
  planned: {
    label: "Planned",
    bg: "bg-[var(--primary)]/10",
    text: "text-[var(--primary)]",
    border: "border-[var(--primary)]/30",
  },
  exploring: {
    label: "Exploring",
    bg: "bg-[var(--foreground-muted)]/10",
    text: "text-[var(--foreground-muted)]",
    border: "border-[var(--foreground-muted)]/30",
  },
};

const TIER_CONFIG: Record<
  FeatureTier,
  { label: string; color: string }
> = {
  core: { label: "Core", color: "var(--success)" },
  growth: { label: "Growth", color: "var(--primary)" },
  enterprise: { label: "Enterprise", color: "var(--ai)" },
};

// ============================================================================
// Feature Card Component
// ============================================================================

function FeatureCard({ feature }: { feature: RoadmapFeature }) {
  const status = STATUS_CONFIG[feature.status];
  const tier = TIER_CONFIG[feature.tier];

  return (
    <article
      className="group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--background)]"
      aria-labelledby={`feature-${feature.id}-title`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3
              id={`feature-${feature.id}-title`}
              className="text-base font-semibold text-foreground"
            >
              {feature.title}
            </h3>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                status.bg,
                status.text,
                status.border
              )}
              role="status"
              aria-label={`Status: ${status.label}`}
            >
              {status.label}
            </span>
          </div>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {feature.timeline ? (
            <div
              className="flex items-center gap-1.5 text-xs text-foreground-muted"
              aria-label={`Expected release: ${feature.timeline}`}
            >
              <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{feature.timeline}</span>
            </div>
          ) : (
            <div className="text-xs text-foreground-muted">Timeline TBD</div>
          )}
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${tier.color}15`,
              color: tier.color,
            }}
          >
            {tier.label}
          </span>
        </div>

        {feature.learnMoreUrl && (
          <Link
            href={feature.learnMoreUrl}
            className="text-xs font-medium text-[var(--primary)] hover:underline focus:outline-none focus:underline"
            aria-label={`Learn more about ${feature.title}`}
          >
            Learn more →
          </Link>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// Category Section Component
// ============================================================================

function CategorySection({
  categoryId,
  features,
}: {
  categoryId: FeatureCategory;
  features: RoadmapFeature[];
}) {
  const category = CATEGORIES[categoryId];
  const Icon = category.icon;

  if (features.length === 0) return null;

  return (
    <section aria-labelledby={`category-${categoryId}-heading`} className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${category.color}15` }}
          aria-hidden="true"
        >
          <span style={{ color: category.color }}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <div className="flex-1">
          <h2
            id={`category-${categoryId}-heading`}
            className="text-lg font-semibold text-foreground"
          >
            {category.label}
          </h2>
          <p className="text-sm text-foreground-muted">{category.description}</p>
        </div>
        <span
          className="text-xs font-medium text-foreground-muted bg-[var(--background-tertiary)] px-2 py-1 rounded-full"
          aria-label={`${features.length} features`}
        >
          {features.length}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label={`${category.label} features`}>
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// Feature Request Modal Component
// ============================================================================

function FeatureRequestModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const modalTitleId = useId();
  const modalDescId = useId();
  const [formData, setFormData] = useState<FeatureRequestFormData>({
    title: "",
    description: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title.trim() || !formData.description.trim()) return;

      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitting(false);
      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ title: "", description: "", category: "" });
        onClose();
      }, 2000);
    },
    [formData, onClose]
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setFormData({ title: "", description: "", category: "" });
      setIsSubmitted(false);
      onClose();
    }
  }, [isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      aria-describedby={modalDescId}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 text-foreground-muted hover:text-foreground rounded-lg hover:bg-[var(--background-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          aria-label="Close modal"
          disabled={isSubmitting}
        >
          <XIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/10 mb-4">
              <CheckIcon className="h-8 w-8 text-[var(--success)]" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Thank You!</h3>
            <p className="text-sm text-foreground-secondary">
              Your feature request has been submitted. We review all requests and prioritize based on demand.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 id={modalTitleId} className="text-xl font-semibold text-foreground">
                Request a Feature
              </h2>
              <p id={modalDescId} className="mt-1 text-sm text-foreground-secondary">
                Help us build the ultimate business OS. What would make your life easier?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="feature-title"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Feature Title <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  id="feature-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Album Designer, Instagram Auto-Post"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  required
                  disabled={isSubmitting}
                  aria-required="true"
                />
              </div>

              <div>
                <label
                  htmlFor="feature-category"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Category
                </label>
                <select
                  id="feature-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value as FeatureCategory | "",
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  disabled={isSubmitting}
                >
                  <option value="">Select a category (optional)</option>
                  {(Object.keys(CATEGORIES) as FeatureCategory[]).map((key) => (
                    <option key={key} value={key}>
                      {CATEGORIES[key].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="feature-description"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Description <span className="text-[var(--error)]">*</span>
                </label>
                <textarea
                  id="feature-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe the feature and how it would help your business. What problem does it solve?"
                  rows={4}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
                  required
                  disabled={isSubmitting}
                  aria-required="true"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-lg border border-[var(--card-border)] bg-transparent px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[var(--background-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Filter Button Component
// ============================================================================

function FilterButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]",
        isActive
          ? "bg-[var(--primary)] text-white"
          : "bg-[var(--background-tertiary)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
      )}
      aria-pressed={isActive}
      aria-label={`Filter by ${label}, ${count} features`}
    >
      {label}
      <span
        className={cn(
          "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs",
          isActive
            ? "bg-white/20 text-white"
            : "bg-[var(--background)] text-foreground-muted"
        )}
        aria-hidden="true"
      >
        {count}
      </span>
    </button>
  );
}

// ============================================================================
// Stats Summary Component
// ============================================================================

function StatsSummary() {
  const inProgress = ROADMAP_FEATURES.filter((f) => f.status === "in_progress").length;
  const planned = ROADMAP_FEATURES.filter((f) => f.status === "planned").length;
  const exploring = ROADMAP_FEATURES.filter((f) => f.status === "exploring").length;
  const categories = Object.keys(CATEGORIES).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
        <div className="text-2xl font-bold text-foreground">{ROADMAP_FEATURES.length}</div>
        <div className="text-xs text-foreground-muted">Total Features</div>
      </div>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
        <div className="text-2xl font-bold text-[var(--success)]">{inProgress}</div>
        <div className="text-xs text-foreground-muted">In Progress</div>
      </div>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
        <div className="text-2xl font-bold text-[var(--primary)]">{planned}</div>
        <div className="text-xs text-foreground-muted">Planned</div>
      </div>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
        <div className="text-2xl font-bold text-foreground-muted">{exploring}</div>
        <div className="text-xs text-foreground-muted">Exploring</div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function RoadmapClient() {
  const [filter, setFilter] = useState<"all" | FeatureStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | FeatureCategory>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredFeatures = ROADMAP_FEATURES.filter((f) => {
    const statusMatch = filter === "all" || f.status === filter;
    const categoryMatch = categoryFilter === "all" || f.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const featuresByCategory = (Object.keys(CATEGORIES) as FeatureCategory[]).reduce(
    (acc, category) => {
      acc[category] = filteredFeatures.filter((f) => f.category === category);
      return acc;
    },
    {} as Record<FeatureCategory, RoadmapFeature[]>
  );

  const statusCounts = {
    all: ROADMAP_FEATURES.length,
    in_progress: ROADMAP_FEATURES.filter((f) => f.status === "in_progress").length,
    planned: ROADMAP_FEATURES.filter((f) => f.status === "planned").length,
    exploring: ROADMAP_FEATURES.filter((f) => f.status === "exploring").length,
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--primary)]/5 via-[var(--card)] to-[var(--ai)]/5 p-6 lg:p-8"
        aria-labelledby="roadmap-hero-title"
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--primary)]/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[var(--ai)]/10 blur-3xl" aria-hidden="true" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] shadow-lg"
              aria-hidden="true"
            >
              <RocketIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 id="roadmap-hero-title" className="text-xl font-bold text-foreground">
                The Complete Business OS
              </h1>
              <p className="text-sm text-foreground-secondary">
                {ROADMAP_FEATURES.length} features across {Object.keys(CATEGORIES).length} categories. One platform to run your entire business.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            aria-haspopup="dialog"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Request a Feature
          </button>
        </div>
      </section>

      {/* Stats Summary */}
      <StatsSummary />

      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("all")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
              categoryFilter === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-tertiary)] text-foreground-secondary hover:bg-[var(--background-hover)]"
            )}
          >
            All Categories
          </button>
          {(Object.keys(CATEGORIES) as FeatureCategory[]).map((cat) => {
            const category = CATEGORIES[cat];
            const count = ROADMAP_FEATURES.filter((f) => f.category === cat).length;
            const Icon = category.icon;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
                  categoryFilter === cat
                    ? "text-white"
                    : "bg-[var(--background-tertiary)] text-foreground-secondary hover:bg-[var(--background-hover)]"
                )}
                style={categoryFilter === cat ? { backgroundColor: category.color } : {}}
              >
                <Icon className="h-3.5 w-3.5" />
                {category.label}
                <span className={cn(
                  "text-[10px] px-1 rounded",
                  categoryFilter === cat ? "bg-white/20" : "bg-[var(--background)]"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filter */}
      <nav aria-label="Filter features by status" className="flex flex-wrap gap-2">
        <FilterButton
          label="All Features"
          count={statusCounts.all}
          isActive={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterButton
          label={STATUS_CONFIG.in_progress.label}
          count={statusCounts.in_progress}
          isActive={filter === "in_progress"}
          onClick={() => setFilter("in_progress")}
        />
        <FilterButton
          label={STATUS_CONFIG.planned.label}
          count={statusCounts.planned}
          isActive={filter === "planned"}
          onClick={() => setFilter("planned")}
        />
        <FilterButton
          label={STATUS_CONFIG.exploring.label}
          count={statusCounts.exploring}
          isActive={filter === "exploring"}
          onClick={() => setFilter("exploring")}
        />
      </nav>

      {/* Categories */}
      <div className="space-y-10" role="region" aria-label="Feature categories">
        {categoryFilter === "all" ? (
          (Object.keys(CATEGORIES) as FeatureCategory[]).map((categoryId) => (
            <CategorySection
              key={categoryId}
              categoryId={categoryId}
              features={featuresByCategory[categoryId]}
            />
          ))
        ) : (
          <CategorySection
            categoryId={categoryFilter}
            features={featuresByCategory[categoryFilter]}
          />
        )}
      </div>

      {/* Empty State */}
      {filteredFeatures.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-12 text-center"
          role="status"
          aria-live="polite"
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--background-tertiary)]"
            aria-hidden="true"
          >
            <RocketIcon className="h-8 w-8 text-foreground-muted" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No features match your filters
          </h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Try adjusting your category or status filters.
          </p>
        </div>
      )}

      {/* Legend & Tiers */}
      <div className="grid gap-6 md:grid-cols-2">
        <section
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
          aria-labelledby="status-legend-heading"
        >
          <h3 id="status-legend-heading" className="mb-4 text-sm font-semibold text-foreground">
            Status Legend
          </h3>
          <dl className="space-y-3">
            <div className="flex items-start gap-3">
              <dt>
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border", STATUS_CONFIG.in_progress.bg, STATUS_CONFIG.in_progress.text, STATUS_CONFIG.in_progress.border)}>
                  In Progress
                </span>
              </dt>
              <dd className="text-xs text-foreground-secondary">Currently being developed</dd>
            </div>
            <div className="flex items-start gap-3">
              <dt>
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border", STATUS_CONFIG.planned.bg, STATUS_CONFIG.planned.text, STATUS_CONFIG.planned.border)}>
                  Planned
                </span>
              </dt>
              <dd className="text-xs text-foreground-secondary">On our roadmap with timeline</dd>
            </div>
            <div className="flex items-start gap-3">
              <dt>
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border", STATUS_CONFIG.exploring.bg, STATUS_CONFIG.exploring.text, STATUS_CONFIG.exploring.border)}>
                  Exploring
                </span>
              </dt>
              <dd className="text-xs text-foreground-secondary">Under consideration</dd>
            </div>
          </dl>
        </section>

        <section
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
          aria-labelledby="tier-legend-heading"
        >
          <h3 id="tier-legend-heading" className="mb-4 text-sm font-semibold text-foreground">
            Plan Tiers
          </h3>
          <dl className="space-y-3">
            <div className="flex items-start gap-3">
              <dt>
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${TIER_CONFIG.core.color}15`, color: TIER_CONFIG.core.color }}>
                  Core
                </span>
              </dt>
              <dd className="text-xs text-foreground-secondary">Available on all plans</dd>
            </div>
            <div className="flex items-start gap-3">
              <dt>
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${TIER_CONFIG.growth.color}15`, color: TIER_CONFIG.growth.color }}>
                  Growth
                </span>
              </dt>
              <dd className="text-xs text-foreground-secondary">Pro plan and above</dd>
            </div>
            <div className="flex items-start gap-3">
              <dt>
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${TIER_CONFIG.enterprise.color}15`, color: TIER_CONFIG.enterprise.color }}>
                  Enterprise
                </span>
              </dt>
              <dd className="text-xs text-foreground-secondary">Enterprise plan only</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* CTA */}
      <section
        className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--background-tertiary)]/50 p-6 text-center"
        aria-labelledby="vote-cta-heading"
      >
        <h3 id="vote-cta-heading" className="text-base font-semibold text-foreground mb-2">
          Help Us Build Your Perfect Business OS
        </h3>
        <p className="text-sm text-foreground-secondary mb-4">
          We prioritize features based on user feedback. Tell us what would replace your other tools!
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Submit a Feature Request
        </button>
      </section>

      {/* Modal */}
      <FeatureRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
