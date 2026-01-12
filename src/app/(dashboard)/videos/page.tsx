export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function VideosPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="videos-page">
      <ComingSoonPage
        title="Videos"
        subtitle="Host and deliver video content"
        icon="🎥"
        description="Upload videos, create highlight reels, and deliver to clients."
        features={[
          "Video hosting and streaming",
          "Highlight reel creation",
          "Client video delivery with password protection",
          "Download and streaming options",
          "Social media export formats",
          "Video analytics and view tracking",
        ]}
        relatedLinks={[
          { label: "Slideshows", href: "/slideshows" },
          { label: "Galleries", href: "/galleries" },
          { label: "Projects", href: "/projects" },
        ]}
      />
    </div>
  );
}
