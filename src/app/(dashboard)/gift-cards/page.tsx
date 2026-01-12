export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function GiftCardsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="gift-cards-page">
      <ComingSoonPage
        title="Gift Cards"
        subtitle="Sell and manage gift certificates"
        icon="🎁"
        description="Create gift cards, track balances, and manage redemptions."
        features={[
          "Create digital gift cards with custom amounts",
          "Beautiful, branded gift card designs",
          "Automated delivery via email with personalized message",
          "Balance tracking and partial redemptions",
          "Expiration date management",
          "Gift card sales reporting",
        ]}
        relatedLinks={[
          { label: "Promo Codes", href: "/coupons" },
          { label: "Services", href: "/services" },
          { label: "Invoices", href: "/invoices" },
        ]}
      />
    </div>
  );
}
