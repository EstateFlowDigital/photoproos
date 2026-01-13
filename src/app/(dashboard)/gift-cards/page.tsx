export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { GiftCardsClient } from "./gift-cards-client";

export default async function GiftCardsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="gift-cards-page">
      <PageHeader
        title="Gift Cards"
        subtitle="Sell and manage gift certificates"
      />

      <GiftCardsClient />
    </div>
  );
}
