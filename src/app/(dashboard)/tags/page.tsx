export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function TagsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Tags"
      subtitle="Manage tags and labels"
      icon="🏷️"
      description="Create and organize tags for clients, projects, and invoices. Set colors and merge duplicates."
      features={[
        "Create and manage tags across all entities",
        "Color-coded tag organization",
        "Merge duplicate tags",
        "Tag usage statistics",
        "Bulk tag assignment",
        "Smart tag suggestions",
      ]}
      relatedLinks={[
        { label: "Clients", href: "/clients" },
        { label: "Projects", href: "/projects" },
        { label: "Custom Fields", href: "/custom-fields" },
      ]}
    />
  );
}
