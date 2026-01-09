export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/dashboard";
import { getPropertyWebsiteById, getPropertyLeads, getPropertyAnalytics } from "@/lib/actions/property-websites";
import { PropertyDetailClient } from "./property-detail-client";

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;

  const [website, leads, analytics] = await Promise.all([
    getPropertyWebsiteById(id),
    getPropertyLeads(id),
    getPropertyAnalytics(id, 7), // Last 7 days
  ]);

  if (!website) {
    notFound();
  }

  return (
    <div className="space-y-6" data-element="properties-detail-page">
      <Breadcrumb
        items={[
          { label: "Properties", href: "/properties" },
          { label: website.address || "Property" },
        ]}
      />
      <PropertyDetailClient website={website} leads={leads} analytics={analytics} />
    </div>
  );
}
