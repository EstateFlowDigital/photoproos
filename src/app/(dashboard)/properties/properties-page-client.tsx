"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
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
