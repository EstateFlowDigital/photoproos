export const dynamic = "force-dynamic";
import { PageHeader, PageContextNav } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getAddons } from "@/lib/actions/addons";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const triggerTypeInfo = {
  always: { label: "Always", color: "bg-green-500/10 text-green-400" },
  with_service: { label: "With Service", color: "bg-blue-500/10 text-blue-400" },
  cart_threshold: { label: "Cart Threshold", color: "bg-purple-500/10 text-purple-400" },
};

export default async function AddonsPage() {
  const addons = await getAddons();

  const activeCount = addons.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Addons"
        subtitle={`${addons.length} addon${addons.length !== 1 ? "s" : ""} • ${activeCount} active`}
        actions={
          <Link
            href="/services/addons/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Addon
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

      {addons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <div className="mx-auto rounded-full bg-[var(--primary)]/10 p-4 w-fit mb-4">
            <SparklesIcon className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No addons yet</h3>
          <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
            Create addons to upsell additional services and increase your revenue per order.
          </p>
          <Link
            href="/services/addons/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Your First Addon
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addons.map((addon) => {
            const triggerInfo = triggerTypeInfo[addon.triggerType as keyof typeof triggerTypeInfo];
            return (
              <Link
                key={addon.id}
                href={`/services/addons/${addon.id}`}
                className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", triggerInfo.color)}>
                        {triggerInfo.label}
                      </span>
                      {addon.isOneTime && (
                        <span className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
                          One-time
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {addon.iconName && (
                        <AddonIcon name={addon.iconName} className="h-4 w-4 text-[var(--primary)]" />
                      )}
                      <h3 className="font-medium text-foreground truncate group-hover:text-[var(--primary)] transition-colors">
                        {addon.name}
                      </h3>
                    </div>
                    {addon.description && (
                      <p className="mt-1 text-sm text-foreground-muted line-clamp-2">
                        {addon.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      addon.isActive
                        ? "bg-green-500/10 text-green-400"
                        : "bg-[var(--background-secondary)] text-foreground-muted"
                    )}
                  >
                    {addon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-semibold text-foreground">
                    +{formatCurrency(addon.priceCents)}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">
                      {addon.compatibleServices.length > 0
                        ? `${addon.compatibleServices.length} compatible service${addon.compatibleServices.length !== 1 ? "s" : ""}`
                        : "All services"}
                    </span>
                    {addon.usageCount > 0 && (
                      <span className="text-foreground-muted">
                        {addon.usageCount} order{addon.usageCount !== 1 ? "s" : ""}
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

function AddonIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "clock":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
        </svg>
      );
    case "star":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
        </svg>
      );
    case "gift":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M9.25 3.75v3h-3a.75.75 0 0 1 0-1.5h1.439a2.25 2.25 0 0 0-1.689-1.5.75.75 0 0 1 0-1.5 3.75 3.75 0 0 1 3.25 1.5ZM10.75 3.75v3h3a.75.75 0 0 0 0-1.5h-1.439a2.25 2.25 0 0 1 1.689-1.5.75.75 0 0 0 0-1.5 3.75 3.75 0 0 0-3.25 1.5ZM4.75 8.25a.75.75 0 0 0-.75.75v3.25c0 .414.336.75.75.75h4.5V8.25h-4.5ZM10.75 8.25v4.75h4.5a.75.75 0 0 0 .75-.75V9a.75.75 0 0 0-.75-.75h-4.5Z" />
          <path d="M4 15.25a2 2 0 0 0 2 2h3.25v-3.5H4v1.5ZM10.75 17.25H14a2 2 0 0 0 2-2v-1.5h-5.25v3.5Z" />
        </svg>
      );
    case "shield":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.563 2 12.162 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
        </svg>
      );
    case "sparkles":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06ZM14.95 3.05a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.06a.75.75 0 0 1 1.06 0ZM3 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 10ZM14 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 14 10ZM5.172 14.828a.75.75 0 0 1 0 1.06l-1.061 1.061a.75.75 0 0 1-1.06-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM14.828 14.828a.75.75 0 0 1 1.061 0l1.06 1.061a.75.75 0 1 1-1.06 1.06l-1.061-1.06a.75.75 0 0 1 0-1.061ZM10 16a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 16Z" />
          <path fillRule="evenodd" d="M10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2.5 4a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
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
