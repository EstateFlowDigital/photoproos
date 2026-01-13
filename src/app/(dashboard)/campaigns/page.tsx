export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { CampaignsClient } from "./campaigns-client";

export default async function CampaignsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="campaigns-page">
      <PageHeader
        title="Marketing Campaigns"
        subtitle="Plan and track marketing initiatives"
      />

      <CampaignsClient />
    </div>
  );
}
