export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MoodBoardDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Mood Board"
      subtitle="Edit and share board"
      icon="📌"
      description="Add images, notes, and color palettes. Share with clients for feedback."
      features={[
        "Drag-and-drop image arrangement",
        "Notes and annotations",
        "Color palette extraction",
        "Client collaboration and feedback",
        "Pinterest import support",
        "Export as PDF or image",
      ]}
      relatedLinks={[
        { label: "All Boards", href: "/mood-boards" },
        { label: "Style Guides", href: "/style-guides" },
      ]}
    />
  );
}
