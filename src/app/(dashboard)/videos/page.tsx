export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { VideosClient } from "./videos-client";

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
