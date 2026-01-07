"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RocketIcon,
  CalendarIcon,
  SparklesIcon,
  PlugIcon,
  MailIcon,
  ImageIcon,
  MessageIcon,
  LayersIcon,
  CameraIcon,
} from "@/components/ui/settings-icons";

// ============================================================================
// Types
// ============================================================================

interface RoadmapFeature {
  id: string;
  title: string;
  description: string;
  category: "integrations" | "marketing" | "workflow" | "communication";
  status: "in_progress" | "planned" | "exploring";
  timeline?: string;
  learnMoreUrl?: string;
}

// ============================================================================
// Data
// ============================================================================

const ROADMAP_FEATURES: RoadmapFeature[] = [
  // Integrations
  {
    id: "google-drive",
    title: "Google Drive",
    description:
      "Seamlessly sync your photos and galleries with Google Drive for automatic backups and easy file sharing.",
    category: "integrations",
    status: "in_progress",
    timeline: "Q1 2026",
  },
  {
    id: "notion",
    title: "Notion",
    description:
      "Connect your workflow with Notion to automatically create project pages and sync client information.",
    category: "integrations",
    status: "planned",
    timeline: "Q2 2026",
  },
  {
    id: "lightroom",
    title: "Adobe Lightroom",
    description:
      "Direct integration with Adobe Lightroom for seamless photo export and editing workflow.",
    category: "integrations",
    status: "exploring",
  },
  {
    id: "capture-one",
    title: "Capture One",
    description:
      "Native integration with Capture One for professional photographers who prefer this editing platform.",
    category: "integrations",
    status: "exploring",
  },

  // Marketing
  {
    id: "email-marketing",
    title: "Email Marketing",
    description:
      "Create beautiful email campaigns, newsletters, and automated sequences to engage your clients and grow your business.",
    category: "marketing",
    status: "planned",
    timeline: "Q2 2026",
    learnMoreUrl: "/features/email-marketing",
  },
  {
    id: "social-media-manager",
    title: "Social Media Manager",
    description:
      "Schedule, publish, and manage your social media content across multiple platforms from one dashboard.",
    category: "marketing",
    status: "planned",
    timeline: "Q3 2026",
    learnMoreUrl: "/features/social-media",
  },

  // Communication
  {
    id: "sms-reminders",
    title: "SMS Reminders",
    description:
      "Automated text message reminders for appointments, gallery deliveries, and payment due dates.",
    category: "communication",
    status: "planned",
    timeline: "Q2 2026",
  },

  // Workflow
  {
    id: "ai-culling",
    title: "AI Photo Culling",
    description:
      "Use AI to automatically identify and select the best shots from your photo sessions, saving hours of manual work.",
    category: "workflow",
    status: "exploring",
  },
  {
    id: "advanced-scheduling",
    title: "Advanced Scheduling",
    description:
      "Enhanced scheduling features including multi-day shoots, buffer times, and team availability management.",
    category: "workflow",
    status: "planned",
    timeline: "Q2 2026",
  },
];

const CATEGORIES = {
  integrations: {
    label: "Integrations",
    description: "Connect with your favorite tools",
    icon: PlugIcon,
    color: "var(--primary)",
  },
  marketing: {
    label: "Marketing & Growth",
    description: "Grow your business and reach more clients",
    icon: SparklesIcon,
    color: "var(--ai)",
  },
  communication: {
    label: "Communication",
    description: "Better ways to connect with clients",
    icon: MessageIcon,
    color: "var(--success)",
  },
  workflow: {
    label: "Workflow & Productivity",
    description: "Work smarter, not harder",
    icon: LayersIcon,
    color: "var(--warning)",
  },
};

const STATUS_STYLES = {
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

// ============================================================================
// Components
// ============================================================================

function FeatureCard({ feature }: { feature: RoadmapFeature }) {
  const status = STATUS_STYLES[feature.status];

  return (
    <div className="group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-semibold text-foreground">
              {feature.title}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}
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
        {feature.timeline ? (
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Expected {feature.timeline}</span>
          </div>
        ) : (
          <div className="text-xs text-foreground-muted">Timeline TBD</div>
        )}

        {feature.learnMoreUrl && (
          <Link
            href={feature.learnMoreUrl}
            className="text-xs font-medium text-[var(--primary)] hover:underline"
          >
            Learn more →
          </Link>
        )}
      </div>
    </div>
  );
}

function CategorySection({
  categoryId,
  features,
}: {
  categoryId: keyof typeof CATEGORIES;
  features: RoadmapFeature[];
}) {
  const category = CATEGORIES[categoryId];
  const Icon = category.icon;

  if (features.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${category.color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color: category.color }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {category.label}
          </h2>
          <p className="text-sm text-foreground-muted">{category.description}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function RoadmapClient() {
  const [filter, setFilter] = useState<"all" | "in_progress" | "planned" | "exploring">("all");

  const filteredFeatures =
    filter === "all"
      ? ROADMAP_FEATURES
      : ROADMAP_FEATURES.filter((f) => f.status === filter);

  const featuresByCategory = {
    integrations: filteredFeatures.filter((f) => f.category === "integrations"),
    marketing: filteredFeatures.filter((f) => f.category === "marketing"),
    communication: filteredFeatures.filter((f) => f.category === "communication"),
    workflow: filteredFeatures.filter((f) => f.category === "workflow"),
  };

  const statusCounts = {
    all: ROADMAP_FEATURES.length,
    in_progress: ROADMAP_FEATURES.filter((f) => f.status === "in_progress").length,
    planned: ROADMAP_FEATURES.filter((f) => f.status === "planned").length,
    exploring: ROADMAP_FEATURES.filter((f) => f.status === "exploring").length,
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--primary)]/5 via-[var(--card)] to-[var(--ai)]/5 p-6 lg:p-8">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[var(--ai)]/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] shadow-lg">
              <RocketIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                What&apos;s Coming Next
              </h1>
              <p className="text-sm text-foreground-secondary">
                We&apos;re constantly improving PhotoProOS. Here&apos;s what we&apos;re working on.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-foreground-muted">Have a feature request?</span>
            <Link
              href="mailto:support@photoproos.com?subject=Feature Request"
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Let us know →
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {(["all", "in_progress", "planned", "exploring"] as const).map((status) => {
          const isActive = filter === status;
          const statusStyle = status === "all" ? null : STATUS_STYLES[status];
          const count = statusCounts[status];

          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-tertiary)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
              }`}
            >
              {status === "all"
                ? "All Features"
                : statusStyle?.label || status}
              <span
                className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[var(--background)] text-foreground-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categories */}
      <div className="space-y-10">
        {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map(
          (categoryId) => (
            <CategorySection
              key={categoryId}
              categoryId={categoryId}
              features={featuresByCategory[categoryId]}
            />
          )
        )}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--background-tertiary)]">
            <RocketIcon className="h-8 w-8 text-foreground-muted" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No features in this category
          </h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Try selecting a different filter to see more features.
          </p>
        </div>
      )}

      {/* Status Legend */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Status Legend
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${STATUS_STYLES.in_progress.bg} ${STATUS_STYLES.in_progress.text} ${STATUS_STYLES.in_progress.border}`}
            >
              In Progress
            </span>
            <p className="text-xs text-foreground-secondary">
              Actively being developed with an expected release date.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${STATUS_STYLES.planned.bg} ${STATUS_STYLES.planned.text} ${STATUS_STYLES.planned.border}`}
            >
              Planned
            </span>
            <p className="text-xs text-foreground-secondary">
              On our roadmap with a tentative timeline.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${STATUS_STYLES.exploring.bg} ${STATUS_STYLES.exploring.text} ${STATUS_STYLES.exploring.border}`}
            >
              Exploring
            </span>
            <p className="text-xs text-foreground-secondary">
              Under consideration based on user feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
