export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { BundleForm } from "@/components/dashboard/bundle-form";
import Link from "next/link";

export default function NewBundlePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Bundle"
        subtitle="Create a new service bundle package"
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
        <span className="text-foreground">New</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <BundleForm mode="create" />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Bundle Tips</h3>
            <ul className="space-y-3 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  1
                </span>
                <span>Bundle complementary services together for maximum value.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  2
                </span>
                <span>Price bundles lower than individual services to incentivize purchases.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  3
                </span>
                <span>Use badge text to highlight popular or recommended bundles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  4
                </span>
                <span>Create bundles for different property types or client needs.</span>
              </li>
            </ul>
          </div>

          {/* Bundle Types Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Bundle Types</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-foreground">Fixed Price</h4>
                <p className="text-foreground-muted mt-1">
                  A set price for all included services. Simple and straightforward.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Tiered</h4>
                <p className="text-foreground-muted mt-1">
                  Multiple pricing levels with different service combinations.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Custom</h4>
                <p className="text-foreground-muted mt-1">
                  Let clients pick and choose from available services.
                </p>
              </div>
            </div>
          </div>
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
