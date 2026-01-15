import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commissions | PhotoProOS",
  description: "Track and manage team commissions.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { CommissionsClient } from "./commissions-client";

export default async function CommissionsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="commissions-page">
      <PageHeader
        title="Commissions"
        subtitle="Track referral and associate commissions"
      />

      <CommissionsClient />
    </div>
  );
}
