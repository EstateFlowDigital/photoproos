export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { LoyaltyClient } from "./loyalty-client";

export default async function LoyaltyPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="loyalty-page">
      <PageHeader
        title="Loyalty Program"
        subtitle="Reward repeat clients"
      />

      <LoyaltyClient />
    </div>
  );
}
