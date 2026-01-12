export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function MembershipsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="memberships-page">
      <ComingSoonPage
        title="Memberships"
        subtitle="Client membership programs"
        icon="💎"
        description="Create membership tiers with recurring billing, perks, and exclusive access."
        features={[
          "Multiple membership tiers",
          "Recurring subscription billing",
          "Member-only pricing and perks",
          "Automatic renewal management",
          "Member portal and dashboard",
          "Membership analytics",
        ]}
        relatedLinks={[
          { label: "Loyalty Program", href: "/loyalty" },
          { label: "VIP Clients", href: "/vip" },
          { label: "Products", href: "/products" },
        ]}
      />
    </div>
  );
}
