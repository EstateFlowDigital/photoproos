export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getOrderPages } from "@/lib/actions/order-pages";

export default async function OrderPagesPage() {
  const orderPages = await getOrderPages();

  const publishedCount = orderPages.filter((p) => p.isPublished).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Pages"
        subtitle={`${orderPages.length} page${orderPages.length !== 1 ? "s" : ""} • ${publishedCount} published`}
        actions={
          <Link
            href="/order-pages/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Order Page
          </Link>
        }
      />

      {orderPages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <div className="mx-auto rounded-full bg-[var(--primary)]/10 p-4 w-fit mb-4">
            <DocumentIcon className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No order pages yet</h3>
          <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
            Create custom branded order pages to let clients self-serve and book your services.
          </p>
          <Link
            href="/order-pages/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Your First Order Page
          </Link>
        </div>
      ) : (
        <div className="auto-grid grid-min-240 grid-gap-4">
          {orderPages.map((page) => (
            <Link
              key={page.id}
              href={`/order-pages/${page.id}`}
              className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate group-hover:text-[var(--primary)] transition-colors">
                    {page.name}
                  </h3>
                  {page.headline && (
                    <p className="mt-1 text-sm text-foreground-muted line-clamp-1">
                      {page.headline}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-foreground-muted font-mono">
                    /order/{page.slug}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                    page.isPublished
                      ? "bg-[var(--success)]/10 text-[var(--success)]"
                      : "bg-[var(--background-secondary)] text-foreground-muted"
                  )}
                >
                  {page.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              <div className="mt-4 auto-grid grid-gap-2 [--grid-min:140px] text-center">
                <div className="rounded-lg bg-[var(--background)] p-2">
                  <p className="text-lg font-semibold text-foreground">{page.bundleCount}</p>
                  <p className="text-xs text-foreground-muted">Bundles</p>
                </div>
                <div className="rounded-lg bg-[var(--background)] p-2">
                  <p className="text-lg font-semibold text-foreground">{page.serviceCount}</p>
                  <p className="text-xs text-foreground-muted">Services</p>
                </div>
                <div className="rounded-lg bg-[var(--background)] p-2">
                  <p className="text-lg font-semibold text-foreground">{page.orderCount}</p>
                  <p className="text-xs text-foreground-muted">Orders</p>
                </div>
              </div>

              {page.client && (
                <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
                  <p className="text-xs text-foreground-muted">
                    For client: <span className="text-foreground">{page.client.name}</span>
                  </p>
                </div>
              )}
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

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}
