export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrganizationSettings } from "@/lib/actions/settings";
import { BrandingSettingsForm } from "./branding-settings-form";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";

const colorPresets = [
  { name: "Blue", primary: "#3b82f6", secondary: "#1e40af", accent: "#22c55e" },
  { name: "Purple", primary: "#8b5cf6", secondary: "#5b21b6", accent: "#f97316" },
  { name: "Green", primary: "#22c55e", secondary: "#15803d", accent: "#3b82f6" },
  { name: "Orange", primary: "#f97316", secondary: "#c2410c", accent: "#8b5cf6" },
  { name: "Pink", primary: "#ec4899", secondary: "#be185d", accent: "#22c55e" },
  { name: "Teal", primary: "#14b8a6", secondary: "#0f766e", accent: "#f97316" },
  { name: "Red", primary: "#ef4444", secondary: "#b91c1c", accent: "#3b82f6" },
  { name: "Indigo", primary: "#6366f1", secondary: "#4338ca", accent: "#22c55e" },
];

export default async function BrandingSettingsPage() {
  const org = await getOrganizationSettings();

  // Determine if user can access white-label features
  const isPaidPlan =
    org?.plan === "pro" || org?.plan === "studio" || org?.plan === "enterprise";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branding"
        subtitle="Customize your logo, colors, and how your portal appears to clients"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      <BrandingSettingsForm
        settings={{
          logoUrl: org?.logoUrl || null,
          logoLightUrl: org?.logoLightUrl || null,
          faviconUrl: org?.faviconUrl || null,
          businessName: org?.name || "Your Business",
          primaryColor: org?.primaryColor || "#3b82f6",
          secondaryColor: org?.secondaryColor || "#8b5cf6",
          accentColor: org?.accentColor || "#22c55e",
          portalMode: (org?.portalMode as "light" | "dark" | "auto") || "dark",
          invoiceLogoUrl: org?.invoiceLogoUrl || null,
          hidePlatformBranding: org?.hidePlatformBranding || false,
          customDomain: org?.customDomain || null,
          slug: org?.slug || "",
        }}
        colorPresets={colorPresets}
        isPaidPlan={isPaidPlan}
        currentPlan={org?.plan || "free"}
      />
    </div>
  );
}
