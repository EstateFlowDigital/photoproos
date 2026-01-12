export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function AdsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Ad Campaigns"
      subtitle="Manage paid advertising"
      icon="📢"
      description="Create and track Facebook, Google, and Instagram ad campaigns."
      features={[
        "Facebook and Instagram ad management",
        "Google Ads integration",
        "Ad spend tracking and budgeting",
        "ROI and conversion tracking",
        "Audience targeting suggestions",
        "Campaign performance analytics",
      ]}
      relatedLinks={[
        { label: "Campaigns", href: "/campaigns" },
        { label: "Social", href: "/social" },
        { label: "Reports", href: "/reports" },
      ]}
    />
  );
}
