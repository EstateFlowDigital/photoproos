export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { BundleForm } from "@/components/dashboard/bundle-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/actions/bundles";

interface BundleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BundleDetailPage({ params }: BundleDetailPageProps) {
  const { id } = await params;

  const bundle = await getBundle(id);

  if (!bundle) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Bundle"
        subtitle="Update your service bundle package"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/services" className="hover:text-foreground transition-colors">
          Services
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link href="/services/bundles" className="hover:text-foreground transition-colors">
          Bundles
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground">{bundle.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <BundleForm
            mode="edit"
            initialData={{
              id: bundle.id,
              name: bundle.name,
              slug: bundle.slug,
              description: bundle.description || "",
              priceCents: bundle.priceCents,
              bundleType: bundle.bundleType as "fixed" | "tiered" | "custom" | "sqft_based" | "tiered_sqft",
              pricingMethod: (bundle.pricingMethod as "fixed" | "per_sqft" | "tiered") || "fixed",
              pricePerSqftCents: bundle.pricePerSqftCents || 0,
              minSqft: bundle.minSqft || 0,
              maxSqft: bundle.maxSqft || null,
              sqftIncrements: bundle.sqftIncrements || 500,
              imageUrl: bundle.imageUrl || "",
              badgeText: bundle.badgeText || "",
              isActive: bundle.isActive,
              isPublic: bundle.isPublic,
              usageCount: bundle.usageCount,
              services: bundle.services.map((s) => ({
                serviceId: s.serviceId,
                isRequired: s.isRequired,
                quantity: s.quantity,
                sortOrder: s.sortOrder,
              })),
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Usage Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Usage</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-foreground-muted">Orders</span>
                <span className="text-sm font-medium text-foreground">{bundle.usageCount}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-foreground-muted">Status</span>
                {bundle.isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--foreground-muted)]/10 px-2 py-0.5 text-xs font-medium text-foreground-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted" />
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-foreground-muted">Visibility</span>
                <span className="text-sm font-medium text-foreground">
                  {bundle.isPublic ? "Public" : "Private"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/order/preview?bundle=${bundle.slug}`}
                className="flex items-center gap-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <EyeIcon className="h-4 w-4" />
                Preview Order Page
              </Link>
              <button
                type="button"
                className="flex items-center gap-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/order/${bundle.slug}`);
                }}
              >
                <LinkIcon className="h-4 w-4" />
                Copy Order Link
              </button>
            </div>
          </div>

          {/* Savings Display */}
          {bundle.savingsPercent && bundle.savingsPercent > 0 && (
            <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 p-4">
              <div className="flex gap-3">
                <TagIcon className="h-5 w-5 text-[var(--success)] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--success)]">
                    {bundle.savingsPercent}% Savings
                  </p>
                  <p className="text-xs text-[var(--success)]/80 mt-1">
                    Clients save compared to individual services
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
      <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 0 0 3 5.5v2.879a2.5 2.5 0 0 0 .732 1.767l6.5 6.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-6.5-6.5A2.5 2.5 0 0 0 8.38 3H5.5ZM6 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}
