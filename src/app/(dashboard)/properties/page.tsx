export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPropertyWebsites } from "@/lib/actions/property-websites";
import { PropertiesClient } from "./properties-client";

export default async function PropertiesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch property websites from database
  const websites = await getPropertyWebsites(auth.organizationId);

  // Calculate stats
  const stats = {
    total: websites.length,
    published: websites.filter((w) => w.isPublished).length,
    totalViews: websites.reduce((acc, w) => acc + w.viewCount, 0),
    totalLeads: websites.reduce((acc, w) => acc + w._count.leads, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property Websites"
        subtitle="Create stunning property marketing pages for your clients"
        actions={
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Website
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Total Websites</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Published</p>
          <p className="mt-1 text-2xl font-bold text-[var(--success)]">{stats.published}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Total Views</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Total Leads</p>
          <p className="mt-1 text-2xl font-bold text-[var(--primary)]">{stats.totalLeads}</p>
        </div>
      </div>

      {/* Client component for filtering and display */}
      <PropertiesClient websites={websites} />
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
