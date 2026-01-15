import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Tutorials | PhotoProOS",
  description: "Watch video tutorials and walkthroughs.",
};

export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { VideoTutorialsClient } from "./videos-client";

export default async function VideosPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="videos-page" className="space-y-6">
      <PageHeader
        title="Video Tutorials"
        subtitle="Learn with step-by-step video guides"
        backHref="/help"
      />

      <VideoTutorialsClient />
    </div>
  );
}
