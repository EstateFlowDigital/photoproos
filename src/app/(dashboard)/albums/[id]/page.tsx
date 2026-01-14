export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Album Designer"
      subtitle="Design and edit album"
      icon="🎨"
      description="Drag-and-drop album designer with layout templates and spread previews."
      features={[
        "Drag-and-drop photo placement",
        "Pre-designed layout templates",
        "Spread and page preview",
        "Auto-layout suggestions",
        "Export to print-ready formats",
        "Client revision requests",
      ]}
      relatedLinks={[
        { label: "All Albums", href: "/albums" },
        { label: "Galleries", href: "/galleries" },
        { label: "Products", href: "/products" },
      ]}
    />
  );
}
