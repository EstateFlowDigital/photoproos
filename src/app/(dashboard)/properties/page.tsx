export const dynamic = "force-dynamic";

import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { getPropertyWebsites, getProjectsWithoutPropertyWebsite } from "@/lib/actions/property-websites";
import { PropertiesPageClient } from "./properties-page-client";

export default async function PropertiesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch property websites and available projects in parallel
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
