export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { ServicesListClient } from "../services-list-client";
import Link from "next/link";
import { photographyServices, type ServiceCategory } from "@/lib/services";

// Demo mode flag
const DEMO_MODE = true;

// Convert predefined services to demo data with usage counts
const demoServices = photographyServices.map((service, index) => ({
  id: service.id,
  name: service.name,
  category: service.category as ServiceCategory,
  description: service.description,
  priceCents: service.basePrice,
  duration: service.estimatedDuration,
  deliverables: service.deliverables,
  isActive: true,
  isDefault: true,
  usageCount: Math.floor(Math.random() * 15) + 1, // Random usage count for demo
}));

// Add some custom user services for demo
const customServices = [
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
  {
    id: "custom-3",
    name: "Archived Package",
    category: "event" as ServiceCategory,
    description: "This service is no longer offered",
    priceCents: 20000,
    duration: "2 hours",
    deliverables: ["Basic coverage"],
    isActive: false,
    isDefault: false,
    usageCount: 3,
  },
];

export default async function ServicesPage() {
  // Demo mode - use static data
  if (DEMO_MODE) {
    const allServices = [...customServices, ...demoServices];

    return (
      <div className="space-y-6">
        <PageHeader
          title="Services"
          subtitle="Manage your photography service packages and pricing"
          actions={
            <Link
              href="/galleries/services/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Service
            </Link>
          }
        />

        {/* Demo Mode Banner */}
        <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
          <p className="text-sm text-[var(--primary)]">
            <strong>Demo Mode:</strong> Viewing sample service packages. Templates are pre-configured service options.
          </p>
        </div>

        {/* Services List */}
        <ServicesListClient services={allServices} />
      </div>
    );
  }

  // Database mode
  const { prisma } = await import("@/lib/db");

  // Get organization (later from auth)
  const organization = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please run the seed script to populate demo data.</p>
      </div>
    );
  }

  // Fetch services with usage counts
  const services = await prisma.service.findMany({
    where: { organizationId: organization.id },
    include: {
      _count: {
        select: {
          projects: true,
          bookings: true,
        },
      },
    },
    orderBy: [{ isDefault: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        subtitle="Manage your photography service packages and pricing"
        actions={
          <Link
            href="/galleries/services/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Service
          </Link>
        }
      />

      {/* Services List */}
      <ServicesListClient
        services={services.map((service) => ({
          id: service.id,
          name: service.name,
          category: service.category as ServiceCategory,
          description: service.description,
          priceCents: service.priceCents,
          duration: service.duration,
          deliverables: service.deliverables,
          isActive: service.isActive,
          isDefault: service.isDefault,
          usageCount: service._count.projects + service._count.bookings,
        }))}
      />
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
