"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type {
  PortfolioType,
  PortfolioTemplate,
  PortfolioSectionType,
} from "@prisma/client";
import {
  publishPortfolioWebsite,
  initializePortfolioSections,
  duplicatePortfolioWebsite,
} from "@/lib/actions/portfolio-websites";

// Import tabs
import { DesignTab } from "./tabs/design-tab";
import { SectionsTab } from "./tabs/sections-tab";
import { ProjectsTab } from "./tabs/projects-tab";
import { AnalyticsTab } from "./tabs/analytics-tab";
import { SettingsTab } from "./tabs/settings-tab";
import { CommentsTab } from "./tabs/comments-tab";
import { ABTestingTab } from "./tabs/ab-testing-tab";
import { PreviewPanel } from "./components/preview-panel";
import { QRCodeModal } from "./components/qr-code-modal";

// ============================================================================
// TYPES
// ============================================================================

interface PortfolioSection {
  id: string;
  sectionType: PortfolioSectionType;
  position: number;
  isVisible: boolean;
  config: Record<string, unknown>;
  customTitle: string | null;
}

interface PortfolioProject {
  id: string;
  projectId: string;
  position: number;
  project: {
    id: string;
    name: string;
    coverImageUrl: string | null;
    status: string;
    client: {
      fullName: string | null;
      email: string;
    } | null;
  };
}

export interface PortfolioWebsite {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  isPublished: boolean;
  portfolioType: PortfolioType;
  template: PortfolioTemplate;
  fontHeading: string | null;
  fontBody: string | null;
  socialLinks: { platform: string; url: string }[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  showBranding: boolean;
  // New fields
  isPasswordProtected: boolean;
  expiresAt: Date | null;
  scheduledPublishAt: Date | null;
  allowDownloads: boolean;
  downloadWatermark: boolean;
  customCss: string | null;
  enableAnimations: boolean;
  // Comments
  allowComments: boolean;
  requireCommentEmail: boolean;
  // Custom Domain
  customDomain: string | null;
  customDomainVerified: boolean;
  customDomainVerificationToken: string | null;
  customDomainVerifiedAt: Date | null;
  customDomainSslStatus: string | null;
  // Relations
  projects: PortfolioProject[];
  sections: PortfolioSection[];
}

export interface AvailableProject {
  id: string;
  name: string;
  status: string;
  coverImageUrl: string | null;
  client: {
    fullName: string | null;
    email: string;
  } | null;
}

export interface QuickStats {
  totalViews: number;
  uniqueVisitors: number;
  lastUpdated: Date;
}

interface PortfolioEditorClientProps {
  website: PortfolioWebsite;
  availableProjects: AvailableProject[];
  quickStats?: QuickStats | null;
}

type TabId = "design" | "sections" | "projects" | "analytics" | "comments" | "abtesting" | "settings";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "design",
    label: "Design",
    icon: <PaletteIcon className="h-4 w-4" />,
  },
  {
    id: "sections",
    label: "Sections",
    icon: <LayoutIcon className="h-4 w-4" />,
  },
  {
    id: "projects",
    label: "Projects",
    icon: <ImagesIcon className="h-4 w-4" />,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <ChartIcon className="h-4 w-4" />,
  },
  {
    id: "comments",
    label: "Comments",
    icon: <MessageIcon className="h-4 w-4" />,
  },
  {
    id: "abtesting",
    label: "A/B Testing",
    icon: <TestTubeIcon className="h-4 w-4" />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <SettingsIcon className="h-4 w-4" />,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PortfolioEditorClient({
  website,
  availableProjects,
  quickStats,
}: PortfolioEditorClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabId>("design");
  const [showPreview, setShowPreview] = useState(false);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);

  const previewUrl = `/portfolio/${website.slug}`;

  // Refresh preview when changes are made
  const refreshPreview = () => {
    setPreviewRefreshKey((prev) => prev + 1);
  };

  // Initialize sections if this is a new portfolio
  useEffect(() => {
    if (website.sections.length === 0) {
      startTransition(async () => {
        const result = await initializePortfolioSections(website.id);
        if (result.success) {
          router.refresh();
        }
      });
    }
  }, [website.id, website.sections.length, router]);

  const handlePublishToggle = () => {
    startTransition(async () => {
      const result = await publishPortfolioWebsite(
        website.id,
        !website.isPublished
      );
      if (result.success) {
        showToast(
          website.isPublished ? "Portfolio unpublished" : "Portfolio published",
          "success"
        );
        router.refresh();
      } else {
        showToast(result.error || "Failed to update publish status", "error");
      }
    });
  };

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicatePortfolioWebsite(website.id);
      if (result.success && result.id) {
        showToast("Portfolio duplicated successfully", "success");
        router.push(`/portfolios/${result.id}`);
      } else {
        showToast(result.error || "Failed to duplicate portfolio", "error");
      }
    });
  };

  const handleCopyLink = async () => {
    const baseUrl = window.location.origin;
    const portfolioUrl = `${baseUrl}/portfolio/${website.slug}`;
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      showToast("Portfolio link copied to clipboard", "success");
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Bar */}
      {quickStats && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
          <div className="flex items-center gap-2">
            <ViewsIcon className="h-4 w-4 text-[var(--primary)]" />
            <div>
              <p className="text-lg font-semibold text-foreground">{quickStats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-foreground-muted">Views (30d)</p>
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--card-border)]" />
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-[var(--success)]" />
            <div>
              <p className="text-lg font-semibold text-foreground">{quickStats.uniqueVisitors.toLocaleString()}</p>
              <p className="text-xs text-foreground-muted">Visitors</p>
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--card-border)]" />
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-foreground-muted" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {formatRelativeTime(new Date(quickStats.lastUpdated))}
              </p>
              <p className="text-xs text-foreground-muted">Last updated</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              website.isPublished
                ? "bg-green-500/10 text-green-400"
                : "bg-[var(--background-secondary)] text-foreground-muted"
            )}
          >
            {website.isPublished ? "Published" : "Draft"}
          </span>
          <span className="text-sm text-foreground-muted">
            {website.sections.length} sections • {website.projects.length}{" "}
            projects
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            title="Generate QR code"
          >
            <QRIcon className="h-4 w-4" />
            QR Code
          </button>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            title="Copy portfolio link"
          >
            <CopyIcon className="h-4 w-4" />
            Copy Link
          </button>
          <button
            onClick={handleDuplicate}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
            title="Duplicate portfolio"
          >
            <DuplicateIcon className="h-4 w-4" />
            Duplicate
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              showPreview
                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                : "border-[var(--card-border)] bg-[var(--card)] text-foreground hover:bg-[var(--background-hover)]"
            )}
          >
            <EyeIcon className="h-4 w-4" />
            {showPreview ? "Hide Preview" : "Live Preview"}
          </button>
          <Link
            href={previewUrl}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Open
          </Link>
          <button
            onClick={handlePublishToggle}
            disabled={isPending}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
              website.isPublished
                ? "border border-[var(--card-border)] bg-[var(--card)] text-foreground hover:bg-[var(--background-hover)]"
                : "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
            )}
          >
            {website.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        <div className="border-b border-[var(--card-border)]">
          <nav className="flex gap-1 p-1" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-[var(--background-secondary)] text-foreground"
                    : "text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "design" && (
            <DesignTab website={website} isPending={isPending} onSave={refreshPreview} />
          )}
          {activeTab === "sections" && (
            <SectionsTab
              website={website}
              isPending={isPending}
              availableProjects={availableProjects.map((p) => ({
                id: p.id,
                name: p.name,
                coverImageUrl: p.coverImageUrl,
              }))}
              onSave={refreshPreview}
            />
          )}
          {activeTab === "projects" && (
            <ProjectsTab
              website={website}
              availableProjects={availableProjects}
              isPending={isPending}
              onSave={refreshPreview}
            />
          )}
          {activeTab === "analytics" && (
            <AnalyticsTab website={website} isPending={isPending} />
          )}
          {activeTab === "comments" && (
            <CommentsTab website={website} isPending={isPending} />
          )}
          {activeTab === "abtesting" && (
            <ABTestingTab website={website} isPending={isPending} />
          )}
          {activeTab === "settings" && (
            <SettingsTab website={website} isPending={isPending} onSave={refreshPreview} />
          )}
        </div>
      </div>

      {/* Live Preview Panel */}
      <PreviewPanel
        slug={website.slug}
        isVisible={showPreview}
        onClose={() => setShowPreview(false)}
        refreshKey={previewRefreshKey}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        portfolioUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/portfolio/${website.slug}`}
        portfolioName={website.name}
      />
    </div>
  );
}

// ============================================================================
// ICONS
// ============================================================================

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function ImagesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 22H4a2 2 0 0 1-2-2V6" />
      <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
      <circle cx="12" cy="8" r="2" />
      <rect width="16" height="16" x="6" y="2" rx="2" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function QRIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}

function ViewsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function TestTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
      <path d="M8.5 2h7" />
      <path d="M14.5 16h-5" />
    </svg>
  );
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}
