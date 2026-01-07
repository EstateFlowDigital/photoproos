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
} from "@/components/ui/settings-icons";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type FeatureCategory = "integrations" | "marketing" | "workflow" | "communication" | "analytics";
type FeatureStatus = "in_progress" | "planned" | "exploring";

interface RoadmapFeature {
  id: string;
  title: string;
  description: string;
  category: FeatureCategory;
  status: FeatureStatus;
  timeline?: string;
  learnMoreUrl?: string;
}

interface FeatureRequestFormData {
  title: string;
  description: string;
  category: FeatureCategory | "";
}

// ============================================================================
// Data
// ============================================================================

const ROADMAP_FEATURES: RoadmapFeature[] = [
  // ============ Integrations ============
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
  {
    id: "icloud-photos",
    title: "iCloud Photos",
    description:
      "Sync galleries with iCloud Photos for Apple users who want seamless backup across their devices.",
    category: "integrations",
    status: "exploring",
  },
  {
    id: "slack-notifications",
    title: "Slack Notifications",
    description:
      "Get instant notifications in Slack when clients view galleries, make payments, or submit forms.",
    category: "integrations",
    status: "planned",
    timeline: "Q3 2026",
  },
  {
    id: "whatsapp-business",
    title: "WhatsApp Business",
    description:
      "Communicate with clients via WhatsApp directly from PhotoProOS with message templates and automation.",
    category: "integrations",
    status: "exploring",
  },

  // ============ Marketing ============
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
  {
    id: "referral-automation",
    title: "Referral Program Automation",
    description:
      "Automatically track referrals, send thank-you gifts, and reward clients who bring you new business.",
    category: "marketing",
    status: "planned",
    timeline: "Q3 2026",
  },
  {
    id: "testimonial-collector",
    title: "Testimonial Collector",
    description:
      "Automatically collect and showcase client testimonials with video, photo, and text options.",
    category: "marketing",
    status: "exploring",
  },
  {
    id: "seo-tools",
    title: "SEO Optimization Tools",
    description:
      "Built-in SEO tools to help your property websites and galleries rank higher in search results.",
    category: "marketing",
    status: "exploring",
  },

  // ============ Communication ============
  {
    id: "sms-reminders",
    title: "SMS Reminders",
    description:
      "Automated text message reminders for appointments, gallery deliveries, and payment due dates.",
    category: "communication",
    status: "planned",
    timeline: "Q2 2026",
  },
  {
    id: "video-messaging",
    title: "Video Messaging",
    description:
      "Record and send quick video messages to clients for a more personal touch in your communication.",
    category: "communication",
    status: "exploring",
  },
  {
    id: "voice-notes",
    title: "Voice Notes",
    description:
      "Send voice notes to clients and team members when typing isn't convenient.",
    category: "communication",
    status: "exploring",
  },
  {
    id: "client-chat-v2",
    title: "Enhanced Client Chat",
    description:
      "Real-time chat with typing indicators, read receipts, and file sharing capabilities.",
    category: "communication",
    status: "in_progress",
    timeline: "Q1 2026",
  },

  // ============ Workflow ============
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
  {
    id: "mobile-app",
    title: "Native Mobile App",
    description:
      "A dedicated iOS and Android app for managing your business on the go with offline support.",
    category: "workflow",
    status: "planned",
    timeline: "Q4 2026",
  },
  {
    id: "batch-operations",
    title: "Batch Operations",
    description:
      "Apply watermarks, resize, rename, and organize hundreds of photos at once with batch processing.",
    category: "workflow",
    status: "planned",
    timeline: "Q2 2026",
  },
  {
    id: "print-fulfillment",
    title: "Print Fulfillment",
    description:
      "Partner with print labs to offer wall art, albums, and prints directly from your galleries.",
    category: "workflow",
    status: "exploring",
  },
  {
    id: "offline-mode",
    title: "Offline Mode",
    description:
      "Work without internet and sync your changes when you're back online. Perfect for on-location shoots.",
    category: "workflow",
    status: "exploring",
  },

  // ============ Analytics ============
  {
    id: "advanced-analytics",
    title: "Advanced Business Analytics",
    description:
      "Deep insights into your business performance with revenue forecasting, client trends, and profitability analysis.",
    category: "analytics",
    status: "planned",
    timeline: "Q3 2026",
  },
  {
    id: "tax-exports",
    title: "Tax Preparation Exports",
    description:
      "Export income, expenses, and mileage in formats ready for your accountant or tax software.",
    category: "analytics",
    status: "planned",
    timeline: "Q2 2026",
  },
  {
    id: "client-ltv",
    title: "Client Lifetime Value",
    description:
      "Track and predict the lifetime value of each client to focus your marketing efforts effectively.",
    category: "analytics",
    status: "exploring",
  },
];

const CATEGORIES: Record<
  FeatureCategory,
  { label: string; description: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
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
  analytics: {
    label: "Analytics & Reporting",
    description: "Data-driven insights for your business",
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

// ============================================================================
// Feature Card Component
// ============================================================================

function FeatureCard({ feature }: { feature: RoadmapFeature }) {
  const status = STATUS_CONFIG[feature.status];

  return (
    <article
      className="group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--background)]"
      aria-labelledby={`feature-${feature.id}-title`}
    >
      <div className="flex items-start justify-between gap-3">
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
        {feature.timeline ? (
          <div
            className="flex items-center gap-1.5 text-xs text-foreground-muted"
            aria-label={`Expected release: ${feature.timeline}`}
          >
            <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Expected {feature.timeline}</span>
          </div>
        ) : (
          <div className="text-xs text-foreground-muted" aria-label="Timeline to be determined">
            Timeline TBD
          </div>
        )}

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
          <Icon className="h-5 w-5" style={{ color: category.color }} />
        </div>
        <div>
          <h2
            id={`category-${categoryId}-heading`}
            className="text-lg font-semibold text-foreground"
          >
            {category.label}
          </h2>
          <p className="text-sm text-foreground-muted">{category.description}</p>
        </div>
        <span
          className="ml-auto text-xs font-medium text-foreground-muted bg-[var(--background-tertiary)] px-2 py-1 rounded-full"
          aria-label={`${features.length} features`}
        >
          {features.length}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2" role="list" aria-label={`${category.label} features`}>
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

      // Simulate API call - in production, this would send to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset after showing success
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
        {/* Close button */}
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
              Your feature request has been submitted. We&apos;ll review it and get back to you.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 id={modalTitleId} className="text-xl font-semibold text-foreground">
                Request a Feature
              </h2>
              <p id={modalDescId} className="mt-1 text-sm text-foreground-secondary">
                Tell us what feature would help your photography business the most.
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
                  placeholder="e.g., Album Designer Tool"
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
                  placeholder="Describe the feature and how it would help your business..."
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
// Main Component
// ============================================================================

export function RoadmapClient() {
  const [filter, setFilter] = useState<"all" | FeatureStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize filtered features
  const filteredFeatures =
    filter === "all"
      ? ROADMAP_FEATURES
      : ROADMAP_FEATURES.filter((f) => f.status === filter);

  // Group by category
  const featuresByCategory = (Object.keys(CATEGORIES) as FeatureCategory[]).reduce(
    (acc, category) => {
      acc[category] = filteredFeatures.filter((f) => f.category === category);
      return acc;
    },
    {} as Record<FeatureCategory, RoadmapFeature[]>
  );

  // Count by status
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
                What&apos;s Coming Next
              </h1>
              <p className="text-sm text-foreground-secondary">
                {ROADMAP_FEATURES.length} features in our roadmap. Here&apos;s what we&apos;re building.
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

      {/* Filter Pills */}
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
        {(Object.keys(CATEGORIES) as FeatureCategory[]).map((categoryId) => (
          <CategorySection
            key={categoryId}
            categoryId={categoryId}
            features={featuresByCategory[categoryId]}
          />
        ))}
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
            No features in this category
          </h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Try selecting a different filter to see more features.
          </p>
        </div>
      )}

      {/* Status Legend */}
      <section
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
        aria-labelledby="status-legend-heading"
      >
        <h3 id="status-legend-heading" className="mb-4 text-sm font-semibold text-foreground">
          Status Legend
        </h3>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <dt>
              <span
                className={cn(
                  "mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                  STATUS_CONFIG.in_progress.bg,
                  STATUS_CONFIG.in_progress.text,
                  STATUS_CONFIG.in_progress.border
                )}
              >
                In Progress
              </span>
            </dt>
            <dd className="text-xs text-foreground-secondary">
              Actively being developed with an expected release date.
            </dd>
          </div>
          <div className="flex items-start gap-3">
            <dt>
              <span
                className={cn(
                  "mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                  STATUS_CONFIG.planned.bg,
                  STATUS_CONFIG.planned.text,
                  STATUS_CONFIG.planned.border
                )}
              >
                Planned
              </span>
            </dt>
            <dd className="text-xs text-foreground-secondary">
              On our roadmap with a tentative timeline.
            </dd>
          </div>
          <div className="flex items-start gap-3">
            <dt>
              <span
                className={cn(
                  "mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                  STATUS_CONFIG.exploring.bg,
                  STATUS_CONFIG.exploring.text,
                  STATUS_CONFIG.exploring.border
                )}
              >
                Exploring
              </span>
            </dt>
            <dd className="text-xs text-foreground-secondary">
              Under consideration based on user feedback.
            </dd>
          </div>
        </dl>
      </section>

      {/* Vote CTA */}
      <section
        className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--background-tertiary)]/50 p-6 text-center"
        aria-labelledby="vote-cta-heading"
      >
        <h3 id="vote-cta-heading" className="text-base font-semibold text-foreground mb-2">
          Don&apos;t see what you need?
        </h3>
        <p className="text-sm text-foreground-secondary mb-4">
          We prioritize features based on user feedback. Let us know what would help your business!
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Submit a Feature Request
        </button>
      </section>

      {/* Feature Request Modal */}
      <FeatureRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
