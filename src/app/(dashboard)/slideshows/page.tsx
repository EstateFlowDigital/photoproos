import { Metadata } from "next";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { SlideshowsClient } from "./slideshows-client";

export const metadata: Metadata = {
  title: "Slideshows | PhotoProOS",
  description: "Create beautiful photo slideshows for clients.",
};

export const dynamic = "force-dynamic";

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
