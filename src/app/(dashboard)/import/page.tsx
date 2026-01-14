export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ImportPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Import Data"
      subtitle="Import from other systems"
      icon="📥"
      description="Import clients, projects, and invoices from CSV or other photography software."
      features={[
        "CSV import for clients, projects, invoices",
        "Import from Honeybook, Dubsado, 17hats",
        "Field mapping and preview",
        "Duplicate detection and merging",
        "Import history and rollback",
        "Batch import progress tracking",
      ]}
      relatedLinks={[
        { label: "Export", href: "/export" },
        { label: "Data Settings", href: "/settings/data" },
        { label: "Clients", href: "/clients" },
      ]}
    />
  );
}
