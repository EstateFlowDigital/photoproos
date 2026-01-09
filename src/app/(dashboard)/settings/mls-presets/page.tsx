export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb } from "@/components/dashboard";
import { getMlsPresets, getMlsProviders } from "@/lib/actions/mls-presets";
import { MlsPresetsClient } from "./mls-presets-client";

export default async function MlsPresetsPage() {
  const [presetsResult, providersResult] = await Promise.all([
    getMlsPresets(),
    getMlsProviders(),
  ]);

  const presets = presetsResult.success ? presetsResult.data : [];
  const providers = providersResult.success ? providersResult.data : [];

  return (
    <div data-element="settings-mls-presets-page" className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Settings", href: "/settings" },
          { label: "MLS Presets" },
        ]}
      />

      <PageHeader
        title="MLS Download Presets"
        subtitle="Configure image dimension presets for client photo downloads"
      />

      <MlsPresetsClient presets={presets} providers={providers} />
    </div>
  );
}
