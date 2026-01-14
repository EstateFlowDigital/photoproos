export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Collection"
      subtitle="View and manage collection"
      icon="📸"
      description="Arrange photos, add descriptions, and share collection links."
      features={[
        "Photo arrangement and ordering",
        "Title and description editing",
        "Cover image selection",
        "Privacy and sharing settings",
        "Download options",
        "View analytics",
      ]}
      relatedLinks={[
        { label: "All Collections", href: "/collections" },
        { label: "Galleries", href: "/galleries" },
      ]}
    />
  );
}
