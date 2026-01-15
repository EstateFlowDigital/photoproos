import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark Settings | PhotoProOS",
  description: "Create and manage watermarks for your gallery photos.",
};

export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb } from "@/components/dashboard";
import { listWatermarkTemplates } from "@/lib/actions/watermark-templates";
import { WatermarkTemplatesClient } from "./watermark-templates-client";

export default async function WatermarkTemplatesPage() {
  const templatesResult = await listWatermarkTemplates();
  const templates = templatesResult.success ? templatesResult.data : [];

  return (
    <div data-element="settings-watermarks-page" className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Settings", href: "/settings" },
          { label: "Watermark Templates" },
        ]}
      />

      <PageHeader
        title="Watermark Templates"
        subtitle="Create and manage reusable watermark presets for your galleries"
      />

      <WatermarkTemplatesClient templates={templates || []} />
    </div>
  );
}
