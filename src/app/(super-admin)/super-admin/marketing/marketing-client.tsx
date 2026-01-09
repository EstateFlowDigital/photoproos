"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  MarketingPage,
  BlogPost,
  Testimonial,
  FAQ,
  TeamMember,
} from "@prisma/client";

// Icons
function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function NewspaperIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function NavigationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  );
}

interface Props {
  pages: MarketingPage[];
  posts: BlogPost[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  team: TeamMember[];
}

// Quick action card
function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  count,
  external,
}: {
  href: string;
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  count?: number;
  external?: boolean;
}) {
  const Component = external ? "a" : Link;
  return (
    <Component
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[var(--primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-[var(--foreground)] truncate">{title}</h3>
          {count !== undefined && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">
              {count}
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--foreground-muted)] truncate">{description}</p>
      </div>
      {external ? (
        <ExternalLinkIcon className="w-4 h-4 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
      ) : (
        <ChevronRightIcon className="w-4 h-4 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </Component>
  );
}

// Stat card
function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: number | string;
  sublabel?: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
      <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
      <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{value}</p>
      {sublabel && (
        <p className="text-xs text-[var(--foreground-muted)] mt-1">{sublabel}</p>
      )}
    </div>
  );
}

// Page list item
function PageListItem({ page }: { page: MarketingPage }) {
  const statusColors = {
    draft: "bg-yellow-500/10 text-yellow-500",
    published: "bg-green-500/10 text-green-500",
    archived: "bg-gray-500/10 text-gray-500",
  };

  return (
    <Link
      href={`/super-admin/marketing/${page.slug}`}
      className="flex items-center gap-3 py-3 px-4 hover:bg-[var(--background-elevated)] rounded-lg transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--foreground)] truncate">{page.title}</span>
          <span className={cn("text-xs px-1.5 py-0.5 rounded-full", statusColors[page.status])}>
            {page.status}
          </span>
        </div>
        <p className="text-sm text-[var(--foreground-muted)] truncate">/{page.slug}</p>
      </div>
      <ChevronRightIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
    </Link>
  );
}

export function MarketingDashboardClient({ pages, posts, testimonials, faqs, team }: Props) {
  const publishedPages = pages.filter((p) => p.status === "published").length;
  const draftPages = pages.filter((p) => p.status === "draft").length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const visibleTestimonials = testimonials.filter((t) => t.isVisible).length;
  const visibleFaqs = faqs.filter((f) => f.isVisible).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Marketing CMS</h1>
          <p className="text-[var(--foreground-muted)]">
            Manage your marketing website content
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary flex items-center gap-2"
        >
          <ExternalLinkIcon className="w-4 h-4" />
          View Site
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Pages" value={pages.length} sublabel={`${publishedPages} published`} />
        <StatCard label="Blog Posts" value={posts.length} sublabel={`${publishedPosts} published`} />
        <StatCard label="Testimonials" value={testimonials.length} sublabel={`${visibleTestimonials} visible`} />
        <StatCard label="FAQs" value={faqs.length} sublabel={`${visibleFaqs} visible`} />
        <StatCard label="Team Members" value={team.length} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <QuickActionCard
            href="/super-admin/marketing/pages"
            icon={FileTextIcon}
            title="Edit Pages"
            description="Homepage, Pricing, Features, etc."
            count={pages.length}
          />
          <QuickActionCard
            href="/super-admin/marketing/blog"
            icon={NewspaperIcon}
            title="Blog Posts"
            description="Create and manage blog content"
            count={posts.length}
          />
          <QuickActionCard
            href="/super-admin/marketing/testimonials"
            icon={QuoteIcon}
            title="Testimonials"
            description="Customer quotes and reviews"
            count={testimonials.length}
          />
          <QuickActionCard
            href="/super-admin/marketing/faqs"
            icon={HelpCircleIcon}
            title="FAQs"
            description="Frequently asked questions"
            count={faqs.length}
          />
          <QuickActionCard
            href="/super-admin/marketing/team"
            icon={UsersIcon}
            title="Team Members"
            description="About page team section"
            count={team.length}
          />
          <QuickActionCard
            href="/super-admin/marketing/navigation"
            icon={NavigationIcon}
            title="Navigation"
            description="Navbar and footer links"
          />
        </div>
      </div>

      {/* Pages List */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="bg-[var(--card)] px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--foreground)]">Marketing Pages</h3>
            <Link
              href="/super-admin/marketing/pages"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {pages.length === 0 ? (
              <div className="p-8 text-center text-[var(--foreground-muted)]">
                <p>No pages yet. Run the seed script to populate content.</p>
              </div>
            ) : (
              pages.slice(0, 6).map((page) => (
                <PageListItem key={page.id} page={page} />
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="bg-[var(--card)] px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--foreground)]">Recent Blog Posts</h3>
            <Link
              href="/super-admin/marketing/blog"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {posts.length === 0 ? (
              <div className="p-8 text-center text-[var(--foreground-muted)]">
                <p>No blog posts yet.</p>
                <Link
                  href="/super-admin/marketing/blog/new"
                  className="text-[var(--primary)] hover:underline mt-2 inline-block"
                >
                  Create your first post
                </Link>
              </div>
            ) : (
              posts.slice(0, 6).map((post) => (
                <Link
                  key={post.id}
                  href={`/super-admin/marketing/blog/${post.id}`}
                  className="flex items-center gap-3 py-3 px-4 hover:bg-[var(--background-elevated)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--foreground)] truncate">
                        {post.title}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full",
                          post.status === "published"
                            ? "bg-green-500/10 text-green-500"
                            : post.status === "draft"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-gray-500/10 text-gray-500"
                        )}
                      >
                        {post.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : "Not published"}
                    </p>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
