import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery Templates | PhotoProOS",
  description: "Customize gallery templates and layouts.",
};

export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb } from "@/components/dashboard";
import { getGalleryTemplates } from "@/lib/actions/gallery-templates";
import { getServices } from "@/lib/actions/services";
import { GalleryTemplatesClient } from "./gallery-templates-client";

export default async function GalleryTemplatesPage() {
  const [templatesResult, servicesResult] = await Promise.all([
    getGalleryTemplates(),
    getServices(),
  ]);

  const templates = templatesResult.success ? templatesResult.data : [];
  const servicesData = Array.isArray(servicesResult)
    ? servicesResult
    : (servicesResult as { data?: unknown })?.data ?? [];
  const services = Array.isArray(servicesData) ? servicesData : [];

  return (
    <div data-element="settings-gallery-templates-page" className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Settings", href: "/settings" },
          { label: "Gallery Templates" },
        ]}
      />

      <PageHeader
        title="Gallery Templates"
        subtitle="Create reusable templates for gallery settings to speed up your workflow"
      />

      <GalleryTemplatesClient templates={templates || []} services={services || []} />
    </div>
  );
}
