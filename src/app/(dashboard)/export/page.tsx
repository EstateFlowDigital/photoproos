export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ExportPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Export Data"
      subtitle="Export your data"
      icon="📤"
      description="Export all your data in CSV, JSON, or PDF format for backup or migration."
      features={[
        "Export to CSV, JSON, PDF formats",
        "Select specific data types to export",
        "Date range filtering",
        "Full account backup",
        "Scheduled automatic exports",
        "Export history and downloads",
      ]}
      relatedLinks={[
        { label: "Import", href: "/import" },
        { label: "Backups", href: "/backups" },
        { label: "Reports", href: "/reports" },
      ]}
    />
  );
}
