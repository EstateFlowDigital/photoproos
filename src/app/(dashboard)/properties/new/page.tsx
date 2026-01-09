export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { getProjectsWithoutPropertyWebsite } from "@/lib/actions/property-websites";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { NewPropertyWebsiteClient } from "./new-property-website-client";

async function getStats(organizationId: string) {
  try {
    const [totalProperties, totalGalleries, recentProperties] = await Promise.all([
      prisma.propertyWebsite.count({ where: { project: { organizationId } } }),
      prisma.project.count({ where: { organizationId } }),
      prisma.propertyWebsite.findMany({
        where: { project: { organizationId } },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
        },
      }),
    ]);

    return { totalProperties, totalGalleries, recentProperties };
  } catch {
    return { totalProperties: 0, totalGalleries: 0, recentProperties: [] };
  }
}

export default async function NewPropertyWebsitePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const [projects, stats] = await Promise.all([
    getProjectsWithoutPropertyWebsite(auth.organizationId),
    getStats(auth.organizationId),
  ]);

  return (
    <div className="space-y-6" data-element="properties-new-page">
      <PageHeader
        title="Create Property Website"
        subtitle="Create a dedicated marketing page for a property"
        actions={
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Properties
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <NewPropertyWebsiteClient projects={projects} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Select a gallery with photos to populate your property website.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Fill in property details for better SEO and searchability.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Add marketing text to engage potential buyers or renters.</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Property Websites</span>
                <span className="text-sm font-medium text-foreground">{stats.totalProperties}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Available Galleries</span>
                <span className="text-sm font-medium text-foreground">{projects.length}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Total Galleries</span>
                <span className="text-sm font-medium text-foreground">{stats.totalGalleries}</span>
              </div>
            </div>
          </div>

          {/* Recent Properties */}
          {stats.recentProperties.length > 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Properties</h2>
              <div className="space-y-3">
                {stats.recentProperties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    <span className="truncate block">{property.address}</span>
                    <span className="text-xs text-foreground-muted">{property.city}, {property.state}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}
