export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getOrganizationSettings } from "@/lib/actions/settings";
import { BrandingSettingsForm } from "./branding-settings-form";

const colorPresets = [
  { name: "Blue", primary: "#3b82f6", secondary: "#1e40af" },
  { name: "Purple", primary: "#8b5cf6", secondary: "#5b21b6" },
  { name: "Green", primary: "#22c55e", secondary: "#15803d" },
  { name: "Orange", primary: "#f97316", secondary: "#c2410c" },
  { name: "Pink", primary: "#ec4899", secondary: "#be185d" },
  { name: "Teal", primary: "#14b8a6", secondary: "#0f766e" },
];

export default async function BrandingSettingsPage() {
  const org = await getOrganizationSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branding"
        subtitle="Customize how your galleries appear to clients"
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Settings
          </Link>
        }
      />

      <BrandingSettingsForm
        settings={{
          logoUrl: org?.logoUrl || null,
          businessName: org?.name || "Your Business",
          primaryColor: org?.primaryColor || "#3b82f6",
          secondaryColor: org?.secondaryColor || "#8b5cf6",
          customDomain: org?.customDomain || null,
          slug: org?.slug || "",
        }}
        colorPresets={colorPresets}
      />
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}
