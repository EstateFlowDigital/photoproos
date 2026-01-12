export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function AbandonedCartsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="abandoned-carts-page">
      <ComingSoonPage
        title="Abandoned Carts"
        subtitle="Recover lost sales"
        icon="🛒"
        description="View abandoned carts, send recovery emails, and track conversion rates."
        features={[
          "View incomplete bookings and orders",
          "Automated cart recovery emails",
          "One-click recovery with saved cart contents",
          "Incentive offers (discounts, free add-ons)",
          "Recovery rate analytics",
          "Revenue recovered tracking",
        ]}
        relatedLinks={[
          { label: "Orders", href: "/orders" },
          { label: "Automations", href: "/automations" },
          { label: "Email Campaigns", href: "/email-campaigns" },
        ]}
      />
    </div>
  );
}
