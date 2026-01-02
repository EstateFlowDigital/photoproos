export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { FeaturesSettingsForm } from "./features-settings-form";
import { getIndustriesArray } from "@/lib/constants/industries";
import { getModulesArray, CORE_MODULES } from "@/lib/constants/modules";

export default async function FeaturesSettingsPage() {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
    select: {
      id: true,
      name: true,
      industries: true,
      primaryIndustry: true,
      enabledModules: true,
    },
  });

  if (!organization) {
    redirect("/dashboard");
  }

  // Get all available industries and modules
  const allIndustries = getIndustriesArray();
  const allModules = getModulesArray().filter((m) => !CORE_MODULES.includes(m.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/settings" className="hover:text-foreground transition-colors">
          Settings
        </Link>
        <span>/</span>
        <span className="text-foreground">Industries & Features</span>
      </div>

      <PageHeader
        title="Industries & Features"
        subtitle="Customize your workflow based on your photography focus"
      />

      <FeaturesSettingsForm
        organizationId={organization.id}
        initialIndustries={(organization.industries as string[]) || []}
        initialPrimaryIndustry={(organization.primaryIndustry as string) || "real_estate"}
        initialEnabledModules={(organization.enabledModules as string[]) || []}
        allIndustries={allIndustries.map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description,
          // Serialize icon name for client component
          icon: i.icon.displayName || "Camera",
          modules: i.modules,
        }))}
        allModules={allModules.map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          industries: m.industries,
          category: m.category,
        }))}
      />
    </div>
  );
}
