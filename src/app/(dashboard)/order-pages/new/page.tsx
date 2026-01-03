export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { OrderPageForm } from "@/components/dashboard/order-page-form";
import Link from "next/link";

export default function NewOrderPagePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Order Page"
        subtitle="Create a custom branded order page for clients"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/order-pages" className="hover:text-foreground transition-colors">
          Order Pages
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground">New</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <OrderPageForm mode="create" />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Order Page Tips</h3>
            <ul className="space-y-3 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  1
                </span>
                <span>Use compelling headlines that speak to your client&apos;s needs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  2
                </span>
                <span>Add testimonials to build trust and credibility.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  3
                </span>
                <span>Feature bundles prominently - they drive higher order values.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  4
                </span>
                <span>Customize branding to match your client&apos;s colors for white-label pages.</span>
              </li>
            </ul>
          </div>

          {/* Use Cases */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Use Cases</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-foreground">General Order Page</h4>
                <p className="text-foreground-muted mt-1">
                  A catch-all page for website visitors to browse and order.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Brokerage-Specific</h4>
                <p className="text-foreground-muted mt-1">
                  Custom branded pages for real estate brokerages.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Campaign Landing</h4>
                <p className="text-foreground-muted mt-1">
                  Targeted pages for marketing campaigns or promotions.
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
