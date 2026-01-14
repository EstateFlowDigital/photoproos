export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SlideshowDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Slideshow Editor"
      subtitle="Edit slideshow"
      icon="🎥"
      description="Arrange photos, add music, customize transitions, and preview."
      features={[
        "Drag-and-drop photo arrangement",
        "Music library and upload",
        "Transition effects customization",
        "Real-time preview",
        "Export in multiple formats",
        "Client viewing link",
      ]}
      relatedLinks={[
        { label: "All Slideshows", href: "/slideshows" },
        { label: "Galleries", href: "/galleries" },
      ]}
    />
  );
}
