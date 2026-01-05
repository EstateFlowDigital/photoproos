export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { PageHeader } from "@/components/dashboard";

export default async function BatchProcessingPage() {
  const organizationId = await requireOrganizationId();

  const [recentGalleries, deliveredCount] = await Promise.all([
    prisma.project.findMany({
      where: {
        organizationId,
        status: { in: ["delivered", "pending"] },
      },
      include: {
        _count: { select: { assets: true } },
        client: { select: { fullName: true, company: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.project.count({
      where: {
        organizationId,
        status: "delivered",
      },
    }),
  ]);

  const totalAssets = recentGalleries.reduce((sum: number, gallery) => sum + gallery._count.assets, 0);
  const totalDownloads = recentGalleries.reduce((sum: number, gallery) => sum + gallery.downloadCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Processing"
        subtitle="Bulk export, download, and deliver galleries faster"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/galleries"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <GalleryIcon className="h-4 w-4" />
              View Galleries
            </Link>
            <Link
              href="/galleries/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              New Gallery
            </Link>
          </div>
        }
      />

      <div className="auto-grid grid-min-200 grid-gap-3">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Delivered Galleries</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{deliveredCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Assets in Queue</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalAssets}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Recent Downloads</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalDownloads}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Recent Galleries</h2>
            <Link
              href="/galleries"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              Open gallery list
            </Link>
          </div>

          {recentGalleries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
              <GalleryIcon className="mx-auto h-10 w-10 text-foreground-muted" />
              <p className="mt-3 text-sm font-medium text-foreground">No galleries to process</p>
              <p className="mt-1 text-xs text-foreground-muted">
                Create a gallery to start batching uploads and exports.
              </p>
              <Link
                href="/galleries/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <PlusIcon className="h-4 w-4" />
                Create Gallery
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentGalleries.map((gallery) => (
                <Link
                  key={gallery.id}
                  href={`/galleries/${gallery.id}`}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--background-hover)]"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{gallery.name}</p>
                    <p className="mt-1 text-xs text-foreground-muted">
                      {gallery._count.assets} assets • {gallery.client?.company || gallery.client?.fullName || "No client"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        gallery.status === "delivered"
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--warning)]/10 text-[var(--warning)]"
                      }`}
                    >
                      {gallery.status === "delivered" ? "Delivered" : "Pending"}
                    </span>
                    <span className="text-xs text-foreground-muted">{gallery.downloadCount} downloads</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground">Batch Workflow</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground-secondary">
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                Upload in bulk and assign metadata once.
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                Export consistent sizes for MLS or print.
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                Deliver galleries in one batch link.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
            <div className="mt-3 space-y-2">
              <Link
                href="/galleries"
                className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <GalleryIcon className="h-4 w-4 text-foreground-muted" />
                Open Galleries
              </Link>
              <Link
                href="/settings/dropbox"
                className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <CloudIcon className="h-4 w-4 text-foreground-muted" />
                Dropbox Sync
              </Link>
            </div>
          </div>
        </div>
      </div>
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

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M4.5 14.75a3.25 3.25 0 0 1-.09-6.498A5.5 5.5 0 0 1 15.5 7.5a3 3 0 0 1-.343 5.983H4.5Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.5a1 1 0 0 1-1.415.001L3.29 9.704a1 1 0 1 1 1.42-1.408l3.086 3.113 6.792-6.82a1 1 0 0 1 1.414 0Z" clipRule="evenodd" />
    </svg>
  );
}
