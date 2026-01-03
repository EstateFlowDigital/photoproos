export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { AddonForm } from "@/components/dashboard/addon-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAddon } from "@/lib/actions/addons";

interface AddonDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AddonDetailPage({ params }: AddonDetailPageProps) {
  const { id } = await params;

  const addon = await getAddon(id);

  if (!addon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Addon"
        subtitle="Update your service addon"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/services" className="hover:text-foreground transition-colors">
          Services
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link href="/services/addons" className="hover:text-foreground transition-colors">
          Addons
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground">{addon.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <AddonForm
            mode="edit"
            initialData={{
              id: addon.id,
              name: addon.name,
              description: addon.description || "",
              priceCents: addon.priceCents,
              imageUrl: addon.imageUrl || "",
              iconName: addon.iconName || "",
              triggerType: addon.triggerType as "always" | "with_service" | "cart_threshold",
              triggerValue: addon.triggerValue || "",
              isActive: addon.isActive,
              isOneTime: addon.isOneTime,
              usageCount: addon.usageCount,
              compatibleServiceIds: addon.compatibleServices.map((s) => s.id),
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
                <span className="text-sm font-medium text-foreground">{addon.usageCount}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-foreground-muted">Status</span>
                {addon.isActive ? (
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
                <span className="text-sm text-foreground-muted">Type</span>
                <span className="text-sm font-medium text-foreground">
                  {addon.isOneTime ? "One-time" : "Recurring"}
                </span>
              </div>
            </div>
          </div>

          {/* Trigger Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Display Trigger</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-foreground-muted">Type</span>
                <span className="text-sm font-medium text-foreground capitalize">
                  {addon.triggerType.replace("_", " ")}
                </span>
              </div>
              {addon.triggerValue && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-foreground-muted">Value</span>
                  <span className="text-sm font-medium text-foreground">
                    {addon.triggerType === "cart_threshold"
                      ? `$${parseInt(addon.triggerValue) / 100}`
                      : addon.triggerValue}
                  </span>
                </div>
              )}
              {addon.compatibleServices.length > 0 && (
                <div>
                  <span className="text-sm text-foreground-muted block mb-2">
                    Compatible Services
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {addon.compatibleServices.map((service) => (
                      <span
                        key={service.id}
                        className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]"
                      >
                        {service.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Potential */}
          {addon.usageCount > 0 && (
            <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 p-4">
              <div className="flex gap-3">
                <CurrencyIcon className="h-5 w-5 text-[var(--success)] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--success)]">
                    ${((addon.priceCents * addon.usageCount) / 100).toLocaleString()} Revenue
                  </p>
                  <p className="text-xs text-[var(--success)]/80 mt-1">
                    Generated from {addon.usageCount} orders
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

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 0 0-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152Z" />
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-6a.75.75 0 0 1 .75.75v.316a3.78 3.78 0 0 1 1.653.713c.426.33.744.74.925 1.2a.75.75 0 0 1-1.395.55 1.35 1.35 0 0 0-.447-.563 2.187 2.187 0 0 0-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 1 1-1.5 0v-.3a3.78 3.78 0 0 1-1.653-.713 2.833 2.833 0 0 1-.925-1.2.75.75 0 0 1 1.395-.55c.12.29.303.532.447.563.264.224.588.373.936.469v-2.998a3.78 3.78 0 0 1-1.653-.713C5.54 9.24 5 8.431 5 7.5c0-.93.54-1.74 1.347-2.254A3.78 3.78 0 0 1 8.25 4.466V4.25A.75.75 0 0 1 9 3.5a.75.75 0 0 1 1 .75Z" clipRule="evenodd" />
    </svg>
  );
}
