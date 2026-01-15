import { Metadata } from "next";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ArchiveClient } from "./archive-client";

export const metadata: Metadata = {
  title: "Archive | PhotoProOS",
  description: "Access archived galleries and projects.",
};

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="archive-page">
      <PageHeader
        title="Archive"
        subtitle="Archived projects and data"
      />

      <ArchiveClient />
    </div>
  );
}
