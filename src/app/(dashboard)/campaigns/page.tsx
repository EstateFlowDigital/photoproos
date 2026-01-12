export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function CampaignsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Marketing Campaigns"
      subtitle="Plan and track marketing initiatives"
      icon="📣"
      description="Create marketing campaigns, track performance, and measure ROI across channels."
      features={[
        "Multi-channel campaign management (email, social, ads)",
        "Campaign budget tracking and ROI analysis",
        "Lead source attribution and conversion tracking",
        "A/B testing for messaging and offers",
        "Seasonal campaign templates (mini sessions, holidays)",
        "Performance dashboards and reporting",
      ]}
      relatedLinks={[
        { label: "Email Campaigns", href: "/email-campaigns" },
        { label: "Social Media", href: "/social" },
        { label: "Ads", href: "/ads" },
      ]}
    />
  );
}
