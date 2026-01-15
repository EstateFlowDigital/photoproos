import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Files | PhotoProOS",
  description: "Browse and manage uploaded files and documents.",
};

export const dynamic = "force-dynamic";

export default async function FilesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Files"
      subtitle="Manage all your uploaded files"
      icon="📁"
      description="File manager with folders, search, and bulk operations."
      features={[
        "Folder organization and hierarchy",
        "Search across all uploaded files",
        "Bulk move, rename, and delete",
        "File preview and metadata",
        "Storage usage tracking",
        "Duplicate file detection",
      ]}
      relatedLinks={[
        { label: "Storage", href: "/storage" },
        { label: "Galleries", href: "/galleries" },
        { label: "Backups", href: "/backups" },
      ]}
    />
  );
}
