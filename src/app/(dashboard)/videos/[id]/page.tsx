export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Video Details"
      subtitle="View and share video"
      icon="▶️"
      description="Preview, edit details, and share video with password protection."
      features={[
        "Video preview and playback",
        "Edit title and description",
        "Password protection settings",
        "Download and sharing options",
        "View count analytics",
        "Client and project linking",
      ]}
      relatedLinks={[
        { label: "All Videos", href: "/videos" },
        { label: "Galleries", href: "/galleries" },
      ]}
    />
  );
}
