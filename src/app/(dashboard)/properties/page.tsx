export const dynamic = "force-dynamic";

import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import {
  getPropertyWebsites,
  getProjectsWithoutPropertyWebsite,
  getAllPropertyLeads,
  getAggregateAnalytics,
} from "@/lib/actions/property-websites";
import { PageHeader, PageContextNav } from "@/components/dashboard";
import { PropertiesPageClient } from "./properties-page-client";
import { LeadsViewClient } from "./leads-view-client";
import { AnalyticsViewClient } from "./analytics-view-client";

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const { view } = await searchParams;

  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Handle Leads view
  if (view === "leads") {
    const leads = await getAllPropertyLeads(auth.organizationId);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Property Leads"
          subtitle="Manage all leads from your property websites"
        />
        <PageContextNav
          items={[
            { label: "Properties", href: "/properties", icon: <HomeIcon className="h-4 w-4" /> },
            { label: "Leads", href: "/properties?view=leads", icon: <UsersIcon className="h-4 w-4" /> },
            { label: "Analytics", href: "/properties?view=analytics", icon: <ChartIcon className="h-4 w-4" /> },
          ]}
        />
        <LeadsViewClient leads={leads} />
      </div>
    );
  }

  // Handle Analytics view
  if (view === "analytics") {
    const analytics = await getAggregateAnalytics(auth.organizationId);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Property Analytics"
          subtitle="Performance overview across all properties"
        />
        <PageContextNav
          items={[
            { label: "Properties", href: "/properties", icon: <HomeIcon className="h-4 w-4" /> },
            { label: "Leads", href: "/properties?view=leads", icon: <UsersIcon className="h-4 w-4" /> },
            { label: "Analytics", href: "/properties?view=analytics", icon: <ChartIcon className="h-4 w-4" /> },
          ]}
        />
        <AnalyticsViewClient analytics={analytics} />
      </div>
    );
  }

  // Default: Properties list view
  const [websites, projects] = await Promise.all([
    getPropertyWebsites(auth.organizationId),
    getProjectsWithoutPropertyWebsite(auth.organizationId),
  ]);

  // Calculate stats
  const stats = {
    total: websites.length,
    published: websites.filter((w) => w.isPublished).length,
    totalViews: websites.reduce((acc, w) => acc + w.viewCount, 0),
    totalLeads: websites.reduce((acc, w) => acc + w._count.leads, 0),
  };

  return (
    <PropertiesPageClient
      websites={websites}
      projects={projects}
      stats={stats}
    />
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
