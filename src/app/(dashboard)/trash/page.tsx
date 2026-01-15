import { Metadata } from "next";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Trash | PhotoProOS",
  description: "Recover deleted items before permanent removal.",
};

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Trash"
      subtitle="Recently deleted items"
      icon="🗑️"
      description="Restore or permanently delete items. Items auto-delete after 30 days."
      features={[
        "View all deleted items",
        "One-click restore functionality",
        "Permanent deletion option",
        "30-day auto-delete policy",
        "Filter by item type (projects, clients, etc.)",
        "Storage space recovery tracking",
      ]}
      relatedLinks={[
        { label: "Archive", href: "/archive" },
        { label: "Data Settings", href: "/settings/data" },
        { label: "Storage", href: "/storage" },
      ]}
    />
  );
}
