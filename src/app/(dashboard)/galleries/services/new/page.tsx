export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { ServiceForm } from "@/components/dashboard/service-form";
import Link from "next/link";

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Service"
        subtitle="Define a new photography service package"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/galleries" className="hover:text-foreground transition-colors">
          Galleries
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link href="/galleries/services" className="hover:text-foreground transition-colors">
          Services
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground">New</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <ServiceForm mode="create" />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Tips</h3>
            <ul className="space-y-3 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  1
                </span>
                <span>Give your service a clear, descriptive name that clients will understand.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  2
                </span>
                <span>Include specific deliverables to set expectations (e.g., &quot;25 edited photos&quot;).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  3
                </span>
                <span>Add an estimated duration to help with scheduling.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                  4
                </span>
                <span>You can always adjust pricing per-gallery when needed.</span>
              </li>
            </ul>
          </div>

          {/* Templates Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-2">Start from a Template</h3>
            <p className="text-sm text-foreground-muted mb-4">
              Browse our pre-configured service packages for inspiration.
            </p>
            <Link
              href="/galleries/services?filter=templates"
              className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
            >
              View templates
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}
