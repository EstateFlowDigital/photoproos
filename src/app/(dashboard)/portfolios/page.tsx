export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { cn } from "@/lib/utils";
import { getPortfolioWebsites } from "@/lib/actions/portfolio-websites";

export default async function PortfolioWebsitesPage() {
  const websites = await getPortfolioWebsites();
  const publishedCount = websites.filter((site) => site.isPublished).length;

  return (
    <div className="space-y-6" data-element="portfolios-page">
      <PageHeader
        title="Portfolio Websites"
        subtitle={`${websites.length} site${websites.length !== 1 ? "s" : ""} • ${publishedCount} published`}
        actions={
          <Link
            href="/portfolios/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] p-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 md:px-4"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden md:inline">Create Portfolio</span>
          </Link>
        }
      />

      {websites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <div className="mx-auto mb-4 w-fit rounded-full bg-[var(--primary)]/10 p-4">
            <GlobeIcon className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No portfolio websites yet</h3>
          <p className="mt-2 max-w-md mx-auto text-sm text-foreground-muted">
            Build a public portfolio to showcase your best galleries, drive inquiries, and share your work in one link.
          </p>
          <Link
            href="/portfolios/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Your First Portfolio
          </Link>
        </div>
      ) : (
        <div className="auto-grid grid-min-240 grid-gap-4">
          {websites.map((site) => (
            <Link
              key={site.id}
              href={`/portfolios/${site.id}`}
              className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-medium text-foreground transition-colors group-hover:text-[var(--primary)]">
                    {site.name}
                  </h3>
                  {site.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-foreground-muted">
                      {site.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs font-mono text-foreground-muted">
                    /portfolio/{site.slug}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                    site.isPublished
                      ? "bg-[var(--success)]/10 text-[var(--success)]"
                      : "bg-[var(--background-secondary)] text-foreground-muted"
                  )}
                >
                  {site.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              <div className="mt-4 auto-grid grid-gap-2 [--grid-min:140px] text-center">
                <div className="rounded-lg bg-[var(--background)] p-2">
                  <p className="text-lg font-semibold text-foreground">{site._count.projects}</p>
                  <p className="text-xs text-foreground-muted">Projects</p>
                </div>
                <div className="rounded-lg bg-[var(--background)] p-2">
                  <p className="text-lg font-semibold text-foreground">
                    {site.isPublished ? "Live" : "Setup"}
                  </p>
                  <p className="text-xs text-foreground-muted">Status</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm3.03-3.72a.75.75 0 0 1-.53.22h-5a.75.75 0 0 1 0-1.5h5a.75.75 0 0 1 .53 1.28Zm.72-3.28a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1 0-1.5h6a.75.75 0 0 1 .75.75Z" clipRule="evenodd" />
    </svg>
  );
}
