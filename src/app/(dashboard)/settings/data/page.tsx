import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Settings | PhotoProOS",
  description: "Manage data export, import, and storage settings.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function DataSettingsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Data Management"
      subtitle="Export and import your data"
      icon="📊"
      description="Export all your data, import from other systems, and manage data retention."
      features={[
        "Full data export (CSV, JSON)",
        "Import from other CRM systems",
        "Data retention policies",
        "Backup and restore options",
        "GDPR compliance tools",
        "Data deletion requests",
      ]}
      relatedLinks={[
        { label: "Settings", href: "/settings" },
        { label: "Import", href: "/import" },
        { label: "Export", href: "/export" },
      ]}
    />
  );
}
