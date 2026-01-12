export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function CommissionsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Commissions"
      subtitle="Track referral and associate commissions"
      icon="💰"
      description="Calculate commissions, track payouts, and manage referral earnings."
      features={[
        "Automatic commission calculations",
        "Multiple commission structures (flat, percentage)",
        "Associate and referral partner payouts",
        "Payout history and tracking",
        "1099 and tax reporting support",
        "Commission statements and reports",
      ]}
      relatedLinks={[
        { label: "Associates", href: "/associates" },
        { label: "Referrals", href: "/referrals" },
        { label: "Payroll", href: "/payroll" },
      ]}
    />
  );
}
