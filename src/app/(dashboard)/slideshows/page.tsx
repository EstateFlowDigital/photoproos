export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function SlideshowsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="slideshows-page">
      <ComingSoonPage
        title="Slideshows"
        subtitle="Create and share photo slideshows"
        icon="🎬"
        description="Build beautiful slideshows with music, transitions, and shareable links."
        features={[
          "Drag-and-drop slideshow builder",
          "Licensed music library for commercial use",
          "Professional transitions and animations",
          "Shareable links for clients and social media",
          "Download as video file (MP4)",
          "Embed on websites and blogs",
        ]}
        relatedLinks={[
          { label: "Galleries", href: "/galleries" },
          { label: "Sneak Peeks", href: "/sneak-peeks" },
          { label: "Reveal Sessions", href: "/reveal" },
        ]}
      />
    </div>
  );
}
