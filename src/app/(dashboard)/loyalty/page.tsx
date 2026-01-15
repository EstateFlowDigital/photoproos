import { Metadata } from "next";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { LoyaltyClient } from "./loyalty-client";

export const metadata: Metadata = {
  title: "Loyalty Program | PhotoProOS",
  description: "Manage loyalty rewards and repeat client incentives.",
};

export const dynamic = "force-dynamic";

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
