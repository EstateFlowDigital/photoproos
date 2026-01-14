export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function MoodBoardsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Mood Boards"
      subtitle="Create inspiration boards for clients"
      icon="🎨"
      description="Build mood boards with colors, styles, and inspiration images for sessions."
      features={[
        "Visual board builder with drag-and-drop",
        "Import from Pinterest and save inspiration",
        "Color palette extraction and suggestions",
        "Share with clients for feedback",
        "Link to specific projects and sessions",
        "Pre-made templates for different shoot types",
      ]}
      relatedLinks={[
        { label: "Prep Guides", href: "/prep-guides" },
        { label: "Style Guides", href: "/style-guides" },
        { label: "Clients", href: "/clients" },
      ]}
    />
  );
}
