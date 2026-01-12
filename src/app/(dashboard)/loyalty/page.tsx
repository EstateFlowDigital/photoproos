export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function LoyaltyPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="loyalty-page">
      <ComingSoonPage
        title="Loyalty Program"
        subtitle="Reward repeat clients"
        icon="⭐"
        description="Create points programs, track rewards, and automate loyalty perks."
        features={[
          "Points earned per booking or dollar spent",
          "Tiered rewards (Bronze, Silver, Gold, VIP)",
          "Automatic reward redemption at checkout",
          "Birthday and anniversary bonuses",
          "Exclusive perks for top-tier members",
          "Points balance visible in client portal",
        ]}
        relatedLinks={[
          { label: "VIP Clients", href: "/vip" },
          { label: "Referrals", href: "/referrals" },
          { label: "Segments", href: "/segments" },
        ]}
      />
    </div>
  );
}
