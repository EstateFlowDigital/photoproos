import { Metadata } from "next";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Custom Fields | PhotoProOS",
  description: "Create custom data fields for clients and projects.",
};

export const dynamic = "force-dynamic";

export default async function CustomFieldsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Custom Fields"
      subtitle="Create custom data fields"
      icon="🔧"
      description="Add custom fields to clients, projects, and invoices to track what matters to you."
      features={[
        "Custom fields for clients, projects, invoices",
        "Multiple field types (text, number, date, dropdown)",
        "Required field validation",
        "Show in reports and exports",
        "Searchable and filterable",
        "Import/export field values",
      ]}
      relatedLinks={[
        { label: "Settings", href: "/settings" },
        { label: "Tags", href: "/tags" },
        { label: "Clients", href: "/clients" },
      ]}
    />
  );
}
