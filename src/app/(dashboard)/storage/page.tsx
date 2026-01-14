export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function StoragePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Storage"
      subtitle="Monitor storage usage and manage space"
      icon="💾"
      description="Track storage usage, clean up old files, and manage your storage plan."
      features={[
        "Storage usage dashboard",
        "Usage by project and file type",
        "Storage cleanup recommendations",
        "Large file identification",
        "Storage plan management",
        "Usage trend analytics",
      ]}
      relatedLinks={[
        { label: "Files", href: "/files" },
        { label: "Backups", href: "/backups" },
        { label: "Settings", href: "/settings" },
      ]}
    />
  );
}
