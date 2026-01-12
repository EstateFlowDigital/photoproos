export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ReferralsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="referrals-page">
      <ComingSoonPage
        title="Referrals"
        subtitle="Track and reward client referrals"
        icon="🎁"
        description="Create referral programs, track referral sources, and automate rewards."
        features={[
          "Referral program with custom rewards",
          "Unique referral links for each client",
          "Track which clients refer the most",
          "Automatic reward credits or discounts",
          "Thank you emails for successful referrals",
          "Referral source attribution for leads",
        ]}
        relatedLinks={[
          { label: "Loyalty Program", href: "/loyalty" },
          { label: "Reviews", href: "/reviews" },
          { label: "Campaigns", href: "/campaigns" },
        ]}
      />
    </div>
  );
}
