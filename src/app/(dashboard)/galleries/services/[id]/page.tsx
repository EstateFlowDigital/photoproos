export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { ServiceForm } from "@/components/dashboard/service-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { photographyServices, type ServiceCategory } from "@/lib/services";

// Demo mode flag
const DEMO_MODE = true;

// Demo custom services
const demoCustomServices = [
  {
    id: "custom-1",
    name: "Premium Real Estate Bundle",
    category: "real_estate" as ServiceCategory,
    description: "Complete real estate photography package with photos, video, and drone footage",
    priceCents: 75000,
    duration: "3-4 hours",
    deliverables: ["50+ edited photos", "2-3 minute video tour", "Drone aerials", "Twilight shots", "Virtual staging for 3 rooms"],
    isActive: true,
    isDefault: false,
    usageCount: 8,
  },
  {
    id: "custom-2",
    name: "Mini Session - Family",
    category: "portrait" as ServiceCategory,
    description: "Quick 30-minute family portrait session, perfect for holiday cards",
    priceCents: 15000,
    duration: "30 minutes",
    deliverables: ["10 edited images", "Digital delivery", "Print release"],
    isActive: true,
    isDefault: false,
    usageCount: 12,
  },
];

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;

  // Demo mode - use static data
  if (DEMO_MODE) {
    // Try to find in custom services first
    let service = demoCustomServices.find(s => s.id === id);

    // If not found, try predefined services (templates)
    if (!service) {
      const predefined = photographyServices.find(s => s.id === id);
      if (predefined) {
        service = {
          id: predefined.id,
          name: predefined.name,
          category: predefined.category as ServiceCategory,
          description: predefined.description,
          priceCents: predefined.basePrice,
          duration: predefined.estimatedDuration,
          deliverables: predefined.deliverables,
          isActive: true,
          isDefault: true,
          usageCount: Math.floor(Math.random() * 15) + 1,
        };
      }
    }

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
              initialData={service}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Stats */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="font-semibold text-foreground mb-4">Usage</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">Galleries</span>
                  <span className="text-sm font-medium text-foreground">{service.usageCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">Bookings</span>
                  <span className="text-sm font-medium text-foreground">0</span>
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
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors text-left">
                  <DuplicateIcon className="h-4 w-4" />
                  Duplicate Service
                </button>
                <Link
                  href="/galleries/new"
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
                >
                  <GalleryIcon className="h-4 w-4" />
                  Create Gallery with this Service
                </Link>
                <Link
                  href="/scheduling/new"
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Create Booking with this Service
                </Link>
              </div>
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

  // Database mode
  const { prisma } = await import("@/lib/db");

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          projects: true,
          bookings: true,
        },
      },
    },
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={service.isDefault ? "View Template" : "Edit Service"}
        subtitle={service.isDefault ? "Template services are read-only" : "Update your service package details"}
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
              usageCount: service._count.projects + service._count.bookings,
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
                <span className="text-sm text-foreground-muted">Galleries</span>
                <span className="text-sm font-medium text-foreground">{service._count.projects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Bookings</span>
                <span className="text-sm font-medium text-foreground">{service._count.bookings}</span>
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
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors text-left">
                <DuplicateIcon className="h-4 w-4" />
                Duplicate Service
              </button>
              <Link
                href="/galleries/new"
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
              >
                <GalleryIcon className="h-4 w-4" />
                Create Gallery with this Service
              </Link>
              <Link
                href="/scheduling/new"
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
              >
                <CalendarIcon className="h-4 w-4" />
                Create Booking with this Service
              </Link>
            </div>
          </div>
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

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
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
