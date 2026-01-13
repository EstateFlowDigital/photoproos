export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ReferralsClient } from "./referrals-client";

export default async function ReferralsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="referrals-page">
      <PageHeader
        title="Referrals"
        subtitle="Track and reward client referrals"
      />

      <ReferralsClient />
    </div>
  );
}
