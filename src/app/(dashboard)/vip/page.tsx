export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function VipPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="vip-page">
      <ComingSoonPage
        title="VIP Clients"
        subtitle="Manage top-tier client relationships"
        icon="👑"
        description="Identify VIP clients, offer exclusive perks, and track high-value relationships."
        features={[
          "Automatic VIP status based on spend thresholds",
          "Exclusive perks and priority booking",
          "VIP-only pricing and discounts",
          "Lifetime value tracking per client",
          "Anniversary and milestone reminders",
          "VIP communication templates",
        ]}
        relatedLinks={[
          { label: "Clients", href: "/clients" },
          { label: "Loyalty Program", href: "/loyalty" },
          { label: "Segments", href: "/segments" },
        ]}
      />
    </div>
  );
}
