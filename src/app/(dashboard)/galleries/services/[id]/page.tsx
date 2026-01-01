export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { ServiceForm } from "@/components/dashboard/service-form";
import { ServiceQuickActions } from "@/components/dashboard/service-quick-actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type ServiceCategory } from "@/lib/services";
import { getService } from "@/lib/actions/services";

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;

  // Fetch service from database
  const service = await getService(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={service.isDefault ? "View Template" : "Edit Service"}
        subtitle={service.isDefault ? "Template services are read-only. Duplicate to customize." : "Update your service package details"}
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
        <span className="text-foreground">{service.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <ServiceForm
            mode="edit"
            initialData={{
              id: service.id,
              name: service.name,
              category: service.category as ServiceCategory,
              description: service.description || "",
              priceCents: service.priceCents,
              duration: service.duration || "",
              deliverables: service.deliverables,
              isActive: service.isActive,
              isDefault: service.isDefault,
              usageCount: service.usageCount,
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Usage Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Usage</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Usage</span>
                <span className="text-sm font-medium text-foreground">{service.usageCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Status</span>
                {service.isActive ? (
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
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <ServiceQuickActions serviceId={service.id} serviceName={service.name} />
          </div>

          {service.isDefault && (
            <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-4">
              <div className="flex gap-3">
                <InfoIcon className="h-5 w-5 text-[var(--warning)] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--warning)]">Template Service</p>
                  <p className="text-xs text-[var(--warning)]/80 mt-1">
                    This is a system template. You can customize pricing and description per-gallery, or duplicate to create your own version.
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

// Icons
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
  );
}
