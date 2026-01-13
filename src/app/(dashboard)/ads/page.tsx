export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { AdsClient } from "./ads-client";

export default async function AdsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="ads-page">
      <PageHeader
        title="Ad Campaigns"
        subtitle="Manage paid advertising"
      />

      <AdsClient />
    </div>
  );
}
