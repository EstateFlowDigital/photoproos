"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  FileText,
  Newspaper,
  Quote,
  HelpCircle,
  Users,
  PanelLeft,
  ChevronRight,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import type {
  MarketingPage,
  BlogPost,
  Testimonial,
  FAQ,
  TeamMember,
} from "@prisma/client";

interface Props {
  pages: MarketingPage[];
  posts: BlogPost[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  team: TeamMember[];
}

// Stat card with proper semantics
function StatCard({
  label,
  value,
  sublabel,
  elementId,
}: {
  label: string;
  value: number | string;
  sublabel?: string;
  elementId: string;
}) {
  return (
    <article
      className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)] min-w-0"
      aria-label={`${label}: ${value}${sublabel ? `, ${sublabel}` : ""}`}
      data-element={elementId}
    >
      <p className="text-sm text-[var(--foreground-muted)] truncate">{label}</p>
      <p className="text-2xl font-bold text-[var(--foreground)] mt-1 tabular-nums">
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-[var(--foreground-muted)] mt-1 truncate">
          {sublabel}
        </p>
      )}
    </article>
  );
}

// Quick action card with proper accessibility
function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  count,
  external,
  elementId,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  count?: number;
  external?: boolean;
  elementId: string;
}) {
  const Component = external ? "a" : Link;

  return (
    <Component
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      data-element={elementId}
      className={cn(
        "group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg",
        "bg-[var(--card)] border border-[var(--border)]",
        "hover:border-[var(--border-hover)] hover:bg-[var(--background-elevated)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "transition-all duration-200",
        "min-h-[64px] sm:min-h-[72px]" // 44px+ touch target
      )}
      aria-label={`${title}${count !== undefined ? ` (${count} items)` : ""}${external ? ", opens in new tab" : ""}`}
    >
      <div
        className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center"
        aria-hidden="true"
      >
        <Icon className="w-5 h-5 text-[var(--primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-[var(--foreground)] truncate text-sm sm:text-base">
            {title}
          </h3>
          {count !== undefined && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-muted)] tabular-nums"
              aria-hidden="true"
            >
              {count}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] truncate mt-0.5">
          {description}
        </p>
      </div>
      <span
        className="flex-shrink-0 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
        aria-hidden="true"
      >
        {external ? (
          <ExternalLink className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </span>
    </Component>
  );
}

// Page list item with proper semantics
function PageListItem({ page, elementId }: { page: MarketingPage; elementId: string }) {
  const statusConfig = {
    draft: {
      className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      label: "Draft"
    },
    published: {
      className: "bg-green-500/10 text-green-600 dark:text-green-400",
      label: "Published"
    },
    archived: {
      className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
      label: "Archived"
    },
  };

  const status = statusConfig[page.status];

  return (
    <Link
      href={`/super-admin/marketing/${page.slug}`}
      className={cn(
        "flex items-center gap-3 py-3 px-4",
        "hover:bg-[var(--background-elevated)] rounded-lg transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset",
        "min-h-[56px]" // Touch target
      )}
      aria-label={`Edit ${page.title}, status: ${status.label}`}
      data-element={elementId}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[var(--foreground)] truncate text-sm sm:text-base">
            {page.title}
          </span>
          <span
            className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", status.className)}
            role="status"
          >
            {status.label}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] truncate">
          /{page.slug}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)] flex-shrink-0" aria-hidden="true" />
    </Link>
  );
}

// Blog post list item
function BlogPostItem({ post, elementId }: { post: BlogPost; elementId: string }) {
  const statusConfig = {
    draft: {
      className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      label: "Draft"
    },
    published: {
      className: "bg-green-500/10 text-green-600 dark:text-green-400",
      label: "Published"
    },
    archived: {
      className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
      label: "Archived"
    },
  };

  const status = statusConfig[post.status];
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Not published";

  return (
    <Link
      href={`/super-admin/marketing/blog/${post.id}`}
      className={cn(
        "flex items-center gap-3 py-3 px-4",
        "hover:bg-[var(--background-elevated)] transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset",
        "min-h-[56px]" // Touch target
      )}
      aria-label={`Edit ${post.title}, status: ${status.label}, ${dateStr}`}
      data-element={elementId}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[var(--foreground)] truncate text-sm sm:text-base">
            {post.title}
          </span>
          <span
            className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", status.className)}
            role="status"
          >
            {status.label}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
          <time dateTime={post.publishedAt?.toISOString()}>{dateStr}</time>
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)] flex-shrink-0" aria-hidden="true" />
    </Link>
  );
}

export function MarketingDashboardClient({ pages = [], posts = [], testimonials = [], faqs = [], team = [] }: Props) {
  // Ensure arrays are valid before filtering
  const safePages = Array.isArray(pages) ? pages : [];
  const safePosts = Array.isArray(posts) ? posts : [];
  const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];
  const safeFaqs = Array.isArray(faqs) ? faqs : [];
  const safeTeam = Array.isArray(team) ? team : [];

  const publishedPages = safePages.filter((p) => p.status === "published").length;
  const publishedPosts = safePosts.filter((p) => p.status === "published").length;
  const visibleTestimonials = safeTestimonials.filter((t) => t.isVisible).length;
  const visibleFaqs = safeFaqs.filter((f) => f.isVisible).length;

  return (
    <div className="space-y-6 sm:space-y-8" data-element="marketing-dashboard">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" data-element="marketing-header">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
            Marketing CMS
          </h1>
          <p className="text-sm sm:text-base text-[var(--foreground-muted)] mt-1">
            Manage your marketing website content
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "btn btn-secondary inline-flex items-center justify-center gap-2",
            "min-h-[44px] px-4 self-start sm:self-auto"
          )}
          aria-label="View marketing site, opens in new tab"
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
          <span>View Site</span>
        </a>
      </header>

      {/* Stats Grid - Responsive */}
      <section aria-labelledby="stats-heading" data-element="marketing-stats-section">
        <h2 id="stats-heading" className="sr-only">Content Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4" data-element="marketing-stats-grid">
          <StatCard
            label="Pages"
            value={safePages.length}
            sublabel={`${publishedPages} published`}
            elementId="marketing-stat-pages"
          />
          <StatCard
            label="Blog Posts"
            value={safePosts.length}
            sublabel={`${publishedPosts} published`}
            elementId="marketing-stat-posts"
          />
          <StatCard
            label="Testimonials"
            value={safeTestimonials.length}
            sublabel={`${visibleTestimonials} visible`}
            elementId="marketing-stat-testimonials"
          />
          <StatCard
            label="FAQs"
            value={safeFaqs.length}
            sublabel={`${visibleFaqs} visible`}
            elementId="marketing-stat-faqs"
          />
          <StatCard
            label="Team"
            value={safeTeam.length}
            elementId="marketing-stat-team"
          />
        </div>
      </section>

      {/* Quick Actions - Responsive */}
      <section aria-labelledby="actions-heading" data-element="marketing-actions-section">
        <h2
          id="actions-heading"
          className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-3 sm:mb-4"
          data-element="marketing-actions-heading"
        >
          Quick Actions
        </h2>
        <nav
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          aria-label="Marketing CMS sections"
          data-element="marketing-actions-grid"
        >
          <QuickActionCard
            href="/super-admin/marketing/pages"
            icon={FileText}
            title="Edit Pages"
            description="Homepage, Pricing, Features, etc."
            count={safePages.length}
            elementId="marketing-action-pages"
          />
          <QuickActionCard
            href="/super-admin/marketing/blog"
            icon={Newspaper}
            title="Blog Posts"
            description="Create and manage blog content"
            count={safePosts.length}
            elementId="marketing-action-blog"
          />
          <QuickActionCard
            href="/super-admin/marketing/testimonials"
            icon={Quote}
            title="Testimonials"
            description="Customer quotes and reviews"
            count={safeTestimonials.length}
            elementId="marketing-action-testimonials"
          />
          <QuickActionCard
            href="/super-admin/marketing/faqs"
            icon={HelpCircle}
            title="FAQs"
            description="Frequently asked questions"
            count={safeFaqs.length}
            elementId="marketing-action-faqs"
          />
          <QuickActionCard
            href="/super-admin/marketing/team"
            icon={Users}
            title="Team Members"
            description="About page team section"
            count={safeTeam.length}
            elementId="marketing-action-team"
          />
          <QuickActionCard
            href="/super-admin/marketing/navigation"
            icon={PanelLeft}
            title="Navigation"
            description="Navbar and footer links"
            elementId="marketing-action-navigation"
          />
          <QuickActionCard
            href="/super-admin/marketing/calendar"
            icon={CalendarDays}
            title="Content Calendar"
            description="Schedule and plan content"
            elementId="marketing-action-calendar"
          />
        </nav>
      </section>

      {/* Content Lists - Responsive */}
      <section aria-labelledby="content-heading" data-element="marketing-content-section">
        <h2 id="content-heading" className="sr-only">Recent Content</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6" data-element="marketing-content-grid">
          {/* Marketing Pages */}
          <article
            className="rounded-lg border border-[var(--border)] overflow-hidden"
            aria-labelledby="pages-list-heading"
            data-element="marketing-pages-card"
          >
            <header className="bg-[var(--card)] px-4 py-3 border-b border-[var(--border)] flex items-start justify-between gap-4 flex-wrap" data-element="marketing-pages-card-header">
              <h3
                id="pages-list-heading"
                className="font-semibold text-[var(--foreground)] text-sm sm:text-base"
                data-element="marketing-pages-card-title"
              >
                Marketing Pages
              </h3>
              <Link
                href="/super-admin/marketing/pages"
                className={cn(
                  "text-sm text-[var(--primary)] hover:underline",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded px-1",
                  "min-h-[44px] inline-flex items-center"
                )}
                data-element="marketing-pages-view-all"
              >
                View All
                <span className="sr-only"> marketing pages</span>
              </Link>
            </header>
            <div className="divide-y divide-[var(--border)]" role="list" data-element="marketing-pages-list">
              {safePages.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-[var(--foreground-muted)]" data-element="marketing-pages-empty">
                  <p className="text-sm sm:text-base">
                    No pages yet. Run the seed script to populate content.
                  </p>
                </div>
              ) : (
                safePages.slice(0, 5).map((page) => (
                  <div key={page.id} role="listitem">
                    <PageListItem page={page} elementId={`marketing-page-item-${page.slug}`} />
                  </div>
                ))
              )}
            </div>
          </article>

          {/* Blog Posts */}
          <article
            className="rounded-lg border border-[var(--border)] overflow-hidden"
            aria-labelledby="posts-list-heading"
            data-element="marketing-posts-card"
          >
            <header className="bg-[var(--card)] px-4 py-3 border-b border-[var(--border)] flex items-start justify-between gap-4 flex-wrap" data-element="marketing-posts-card-header">
              <h3
                id="posts-list-heading"
                className="font-semibold text-[var(--foreground)] text-sm sm:text-base"
                data-element="marketing-posts-card-title"
              >
                Recent Blog Posts
              </h3>
              <Link
                href="/super-admin/marketing/blog"
                className={cn(
                  "text-sm text-[var(--primary)] hover:underline",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded px-1",
                  "min-h-[44px] inline-flex items-center"
                )}
                data-element="marketing-posts-view-all"
              >
                View All
                <span className="sr-only"> blog posts</span>
              </Link>
            </header>
            <div className="divide-y divide-[var(--border)]" role="list" data-element="marketing-posts-list">
              {safePosts.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-[var(--foreground-muted)]" data-element="marketing-posts-empty">
                  <p className="text-sm sm:text-base">No blog posts yet.</p>
                  <Link
                    href="/super-admin/marketing/blog"
                    className={cn(
                      "text-[var(--primary)] hover:underline mt-2 inline-block",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded px-1"
                    )}
                    data-element="marketing-posts-create-first"
                  >
                    Create your first post
                  </Link>
                </div>
              ) : (
                safePosts.slice(0, 5).map((post) => (
                  <div key={post.id} role="listitem">
                    <BlogPostItem post={post} elementId={`marketing-post-item-${post.id}`} />
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
