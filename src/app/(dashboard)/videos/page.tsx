import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { VideosClient } from "./videos-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Videos | PhotoProOS",
  description: "Manage video content and deliverables for clients.",
};

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="videos-page">
      <PageHeader
        title="Videos"
        subtitle="Host and deliver video content"
      />

      <VideosClient />
    </div>
  );
}
