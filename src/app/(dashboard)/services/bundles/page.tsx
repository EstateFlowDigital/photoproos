export const dynamic = "force-dynamic";
import { PageHeader, PageContextNav } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getBundles } from "@/lib/actions/bundles";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const bundleTypeInfo = {
  fixed: { label: "Fixed", color: "bg-blue-500/10 text-blue-400" },
  tiered: { label: "Tiered", color: "bg-purple-500/10 text-purple-400" },
  custom: { label: "Custom", color: "bg-amber-500/10 text-amber-400" },
};

export default async function BundlesPage() {
  const bundles = await getBundles();

  const activeCount = bundles.filter((b) => b.isActive).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Bundles"
        subtitle={`${bundles.length} bundle${bundles.length !== 1 ? "s" : ""} • ${activeCount} active`}
        actions={
          <Link
            href="/services/bundles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Bundle
          </Link>
        }
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "Services", href: "/services", icon: <BriefcaseIcon className="h-4 w-4" /> },
          { label: "Bundles", href: "/services/bundles", icon: <CubeIcon className="h-4 w-4" /> },
          { label: "Addons", href: "/services/addons", icon: <SparklesIcon className="h-4 w-4" /> },
        ]}
      />

      {bundles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <div className="mx-auto rounded-full bg-[var(--primary)]/10 p-4 w-fit mb-4">
            <CubeIcon className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No bundles yet</h3>
          <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
            Create service bundles to offer package deals and increase your average order value.
          </p>
          <Link
            href="/services/bundles/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Your First Bundle
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => {
            const typeInfo = bundleTypeInfo[bundle.bundleType as keyof typeof bundleTypeInfo];
            return (
              <Link
                key={bundle.id}
                href={`/services/bundles/${bundle.id}`}
                className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {bundle.badgeText && (
                        <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                          {bundle.badgeText}
                        </span>
                      )}
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", typeInfo.color)}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <h3 className="font-medium text-foreground truncate group-hover:text-[var(--primary)] transition-colors">
                      {bundle.name}
                    </h3>
                    {bundle.description && (
                      <p className="mt-1 text-sm text-foreground-muted line-clamp-2">
                        {bundle.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      bundle.isActive
                        ? "bg-green-500/10 text-green-400"
                        : "bg-[var(--background-secondary)] text-foreground-muted"
                    )}
                  >
                    {bundle.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-semibold text-foreground">
                    {formatCurrency(bundle.priceCents)}
                  </span>
                  {bundle.savingsPercent && bundle.savingsPercent > 0 && (
                    <span className="text-sm text-[var(--success)]">
                      Save {bundle.savingsPercent}%
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">
                      {bundle.services.length} service{bundle.services.length !== 1 ? "s" : ""} included
                    </span>
                    {bundle.usageCount > 0 && (
                      <span className="text-foreground-muted">
                        {bundle.usageCount} order{bundle.usageCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
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

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z" clipRule="evenodd" />
      <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 0 1-9.274 0C3.985 17.585 3 16.402 3 15.055Z" />
    </svg>
  );
}

function CubeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.362 1.093a.75.75 0 0 0-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925ZM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0 0 18 14.25V6.443ZM9.25 18.693v-8.25l-7.25-4v7.807a.75.75 0 0 0 .388.657l6.862 3.786Z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06ZM14.95 3.05a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.06a.75.75 0 0 1 1.06 0ZM3 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 10ZM14 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 14 10ZM5.172 14.828a.75.75 0 0 1 0 1.06l-1.061 1.061a.75.75 0 0 1-1.06-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM14.828 14.828a.75.75 0 0 1 1.061 0l1.06 1.061a.75.75 0 1 1-1.06 1.06l-1.061-1.06a.75.75 0 0 1 0-1.061ZM10 16a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 16Z" />
      <path fillRule="evenodd" d="M10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2.5 4a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" clipRule="evenodd" />
    </svg>
  );
}
