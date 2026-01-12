export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function CouponsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="coupons-page">
      <ComingSoonPage
        title="Coupons & Promo Codes"
        subtitle="Create and manage discount codes"
        icon="🏷️"
        description="Create promo codes with limits, expiration dates, and usage tracking."
        features={[
          "Percentage or fixed amount discounts",
          "Usage limits (per code or per customer)",
          "Expiration date and start date scheduling",
          "Restrict to specific services or products",
          "Minimum purchase requirements",
          "Usage analytics and revenue impact tracking",
        ]}
        relatedLinks={[
          { label: "Gift Cards", href: "/gift-cards" },
          { label: "Campaigns", href: "/campaigns" },
        ]}
      />
    </div>
  );
}
