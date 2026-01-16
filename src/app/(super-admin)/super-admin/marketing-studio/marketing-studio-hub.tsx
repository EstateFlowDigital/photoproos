"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  PenSquare,
  Calendar,
  Palette,
  LayoutTemplate,
  ImageIcon,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  Smartphone,
  Quote,
  Columns,
  FileImage,
  Edit3,
  Trash2,
} from "lucide-react";
import { PLATFORM_LIST } from "@/lib/marketing-studio/platforms";

// Custom icons for platforms not in lucide
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.95s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.52.77 1.52 1.68 0 1.02-.65 2.55-.99 3.97-.28 1.19.6 2.16 1.78 2.16 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5-4.88-3.41 0-5.41 2.55-5.41 5.2 0 1.02.39 2.13.89 2.73a.35.35 0 0 1 .08.34l-.33 1.35c-.05.22-.18.27-.41.16-1.53-.72-2.49-2.96-2.49-4.77 0-3.88 2.82-7.45 8.14-7.45 4.28 0 7.6 3.05 7.6 7.12 0 4.25-2.68 7.67-6.4 7.67-1.25 0-2.42-.65-2.82-1.42l-.77 2.93c-.28 1.07-1.03 2.42-1.54 3.24A12 12 0 1 0 12 0z" />
    </svg>
  );
}

const QUICK_ACTIONS = [
  {
    id: "new-post",
    title: "Create New Post",
    description: "Design a social media post with mockups and captions",
    icon: PenSquare,
    href: "/super-admin/marketing-studio/composer",
    color: "var(--primary)",
    primary: true,
  },
  {
    id: "from-mockup",
    title: "Quick from Mockup",
    description: "Start with a mockup from the library",
    icon: ImageIcon,
    href: "/super-admin/marketing-studio/composer?source=mockup",
    color: "var(--success)",
  },
  {
    id: "templates",
    title: "Browse Templates",
    description: "Start with a pre-designed template",
    icon: LayoutTemplate,
    href: "/super-admin/marketing-studio/templates",
    color: "var(--ai)",
  },
];

// Workflow shortcuts for common tasks
const WORKFLOW_SHORTCUTS = [
  {
    id: "story",
    title: "Quick Story",
    description: "Create a vertical story for Instagram/Facebook",
    icon: Smartphone,
    href: "/super-admin/marketing-studio/composer?platform=instagram&format=story",
    color: "#E4405F",
  },
  {
    id: "quote",
    title: "Quote Graphic",
    description: "Create a testimonial or quote post",
    icon: Quote,
    href: "/super-admin/marketing-studio/templates?category=testimonial",
    color: "#8b5cf6",
  },
  {
    id: "carousel",
    title: "Carousel Post",
    description: "Create a multi-image carousel",
    icon: Columns,
    href: "/super-admin/marketing-studio/composer?format=carousel",
    color: "#f97316",
  },
  {
    id: "before-after",
    title: "Before & After",
    description: "Showcase editing transformations",
    icon: FileImage,
    href: "/super-admin/marketing-studio/templates?category=before-after",
    color: "#22c55e",
  },
];

// Storage key for saved compositions
const SAVED_COMPOSITIONS_KEY = "photoproos-saved-compositions";

interface SavedComposition {
  id: string;
  name: string;
  platform: string;
  format: string;
  updatedAt: string;
  thumbnail?: string;
}

// Get saved compositions from localStorage
function getSavedCompositions(): SavedComposition[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SAVED_COMPOSITIONS_KEY);
    if (!stored) return [];
    const compositions = JSON.parse(stored);
    // Return most recent 4 compositions
    return compositions
      .sort((a: SavedComposition, b: SavedComposition) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 4);
  } catch {
    return [];
  }
}

// Delete a saved composition
function deleteSavedComposition(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(SAVED_COMPOSITIONS_KEY);
    if (!stored) return;
    const compositions = JSON.parse(stored);
    const filtered = compositions.filter((c: SavedComposition) => c.id !== id);
    localStorage.setItem(SAVED_COMPOSITIONS_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore errors
  }
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
};

const FEATURES = [
  {
    icon: Target,
    title: "Platform-Accurate Previews",
    description: "See exactly how your post will look on each platform before you publish",
  },
  {
    icon: Sparkles,
    title: "Mockup Integration",
    description: "Use your PhotoProOS mockups directly in your social media content",
  },
  {
    icon: Clock,
    title: "Quick Export",
    description: "Download platform-optimized images ready for posting",
  },
];

export function MarketingStudioHub() {
  const [savedCompositions, setSavedCompositions] = React.useState<SavedComposition[]>([]);

  // Load saved compositions on mount
  React.useEffect(() => {
    setSavedCompositions(getSavedCompositions());
  }, []);

  // Handle delete composition
  const handleDeleteComposition = React.useCallback((id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteSavedComposition(id);
      setSavedCompositions(getSavedCompositions());
    }
  }, []);

  return (
    <div className="marketing-studio-hub space-y-6 sm:space-y-8">
      {/* Quick Actions */}
      <section data-element="quick-actions" aria-labelledby="quick-actions-heading">
        <h2
          id="quick-actions-heading"
          className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-4"
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                "group relative flex flex-col rounded-xl border p-4 sm:p-6 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                action.primary
                  ? "border-[var(--primary)]/30 bg-[var(--primary)]/5 hover:border-[var(--primary)] hover:bg-[var(--primary)]/10"
                  : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)] hover:shadow-lg"
              )}
              aria-label={`${action.title}: ${action.description}`}
            >
              <div
                className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <action.icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: action.color }} aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-[var(--foreground-muted)] flex-1">
                {action.description}
              </p>
              <div className="mt-3 sm:mt-4 flex items-center text-sm font-medium text-[var(--primary)] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                Get started <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Workflow Shortcuts */}
      <section data-element="workflow-shortcuts" aria-labelledby="workflow-shortcuts-heading">
        <h2
          id="workflow-shortcuts-heading"
          className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-4"
        >
          Quick Workflows
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {WORKFLOW_SHORTCUTS.map((shortcut) => (
            <Link
              key={shortcut.id}
              href={shortcut.href}
              className="group flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 hover:border-[var(--border-hover)] hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              aria-label={`${shortcut.title}: ${shortcut.description}`}
            >
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${shortcut.color}15` }}
              >
                <shortcut.icon className="h-4 w-4" style={{ color: shortcut.color }} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-[var(--foreground)] truncate">
                  {shortcut.title}
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] truncate">
                  {shortcut.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Drafts */}
      {savedCompositions.length > 0 && (
        <section data-element="recent-drafts" aria-labelledby="recent-drafts-heading">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="recent-drafts-heading"
              className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider"
            >
              Recent Drafts
            </h2>
            <Link
              href="/super-admin/marketing-studio/composer"
              className="text-xs text-[var(--primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {savedCompositions.map((composition) => {
              const platformIcon = PLATFORM_ICONS[composition.platform] || ImageIcon;
              const PlatformIcon = platformIcon;
              return (
                <article
                  key={composition.id}
                  className="group relative flex flex-col rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden hover:border-[var(--border-hover)] transition-colors"
                >
                  {/* Thumbnail or placeholder */}
                  <div className="aspect-video bg-[var(--background-hover)] flex items-center justify-center">
                    {composition.thumbnail ? (
                      <img
                        src={composition.thumbnail}
                        alt={composition.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-[var(--foreground-muted)]" aria-hidden="true" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <PlatformIcon className="h-3.5 w-3.5 text-[var(--foreground-muted)]" aria-hidden="true" />
                      <span className="text-xs text-[var(--foreground-muted)] capitalize">
                        {composition.platform} {composition.format}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[var(--foreground)] truncate">
                      {composition.name}
                    </h3>
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">
                      {new Date(composition.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link
                      href={`/super-admin/marketing-studio/composer?load=${composition.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteComposition(composition.id, composition.name);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Supported Platforms */}
      <section data-element="platforms" aria-labelledby="platforms-heading">
        <h2
          id="platforms-heading"
          className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-4"
        >
          Supported Platforms
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PLATFORM_LIST.map((platform) => {
            const Icon = PLATFORM_ICONS[platform.id] || ImageIcon;
            return (
              <article
                key={platform.id}
                className="flex flex-col items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 sm:p-4 hover:border-[var(--border-hover)] transition-colors"
              >
                <div
                  className="mb-2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${platform.color}15` }}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: platform.color }} aria-hidden="true" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]">
                  {platform.name}
                </span>
                <span className="text-[10px] sm:text-xs text-[var(--foreground-muted)]">
                  {platform.formats.length} format{platform.formats.length !== 1 ? "s" : ""}
                </span>
              </article>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section data-element="features" aria-labelledby="features-heading">
        <h2
          id="features-heading"
          className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-4"
        >
          What You Can Do
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="flex items-start gap-3 sm:gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-5"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--primary)]" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Navigation Links */}
      <nav
        data-element="navigation"
        className="pt-4 border-t border-[var(--card-border)]"
        aria-label="Marketing Studio pages"
      >
        <ul className="flex flex-wrap gap-3 sm:gap-4">
          <li>
            <Link
              href="/super-admin/mockups"
              className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-lg p-1"
            >
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
              <span>Mockup Library</span>
            </Link>
          </li>
          <li>
            <Link
              href="/super-admin/marketing-studio/brand-kit"
              className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-lg p-1"
            >
              <Palette className="h-4 w-4" aria-hidden="true" />
              <span>Brand Kit</span>
            </Link>
          </li>
          <li>
            <Link
              href="/super-admin/marketing-studio/calendar"
              className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-lg p-1"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>Content Calendar</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
