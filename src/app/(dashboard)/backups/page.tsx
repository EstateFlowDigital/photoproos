import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backups | PhotoProOS",
  description: "Manage backup settings and restore points for your data.",
};

export const dynamic = "force-dynamic";

export default async function BackupsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Backups"
      subtitle="Manage data backups and exports"
      icon="🔐"
      description="Schedule automatic backups, download data exports, and restore from backups."
      features={[
        "Automatic daily/weekly backups",
        "Manual backup creation",
        "Download backup archives",
        "Point-in-time restore",
        "Backup history and logs",
        "Retention policy settings",
      ]}
      relatedLinks={[
        { label: "Export", href: "/export" },
        { label: "Storage", href: "/storage" },
        { label: "Data Settings", href: "/settings/data" },
      ]}
    />
  );
}
