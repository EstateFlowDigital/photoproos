"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, PageContextNav } from "@/components/dashboard";
import { CreatePropertyModal } from "@/components/modals/create-property-modal";
import { PropertiesClient } from "./properties-client";
import type { PropertyWebsiteWithRelations } from "@/lib/actions/property-websites";

interface Project {
  id: string;
  name: string;
  status: string;
  coverImageUrl: string | null;
  client: {
    fullName: string | null;
    company: string | null;
  } | null;
  location: {
    formattedAddress: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
  } | null;
}

interface Stats {
  total: number;
  published: number;
  totalViews: number;
  totalLeads: number;
}

interface PropertiesPageClientProps {
  websites: PropertyWebsiteWithRelations[];
  projects: Project[];
  stats: Stats;
}

export function PropertiesPageClient({
  websites,
  projects,
  stats,
}: PropertiesPageClientProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handlePropertyCreated = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property Websites"
        subtitle="Create stunning property marketing pages for your clients"
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Website
          </button>
        }
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "Properties", href: "/properties", icon: <HomeIcon className="h-4 w-4" /> },
          { label: "Leads", href: "/properties?view=leads", icon: <UsersIcon className="h-4 w-4" /> },
          { label: "Analytics", href: "/properties?view=analytics", icon: <ChartIcon className="h-4 w-4" /> },
        ]}
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

      {/* Property List */}
      <PropertiesClient websites={websites} />

      {/* Create Property Modal */}
      <CreatePropertyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handlePropertyCreated}
        projects={projects}
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

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}
