export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { SegmentsClient } from "./segments-client";

export default async function SegmentsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="segments-page">
      <PageHeader
        title="Client Segments"
        subtitle="Group clients for targeted marketing"
      />

      <SegmentsClient />
    </div>
  );
}
