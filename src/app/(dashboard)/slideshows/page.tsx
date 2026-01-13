export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { SlideshowsClient } from "./slideshows-client";

export default async function SlideshowsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="slideshows-page">
      <PageHeader
        title="Slideshows"
        subtitle="Create and share photo slideshows with music"
      />

      <SlideshowsClient />
    </div>
  );
}
