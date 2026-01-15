import { Metadata } from "next";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ReferralsClient } from "./referrals-client";

export const metadata: Metadata = {
  title: "Referrals | PhotoProOS",
  description: "Track client referrals and manage referral rewards.",
};

export const dynamic = "force-dynamic";

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
