export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmailCampaignDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Email Campaign"
      subtitle="Campaign analytics"
      icon="📧"
      description="View campaign analytics, A/B test results, and subscriber engagement metrics."
      features={[
        "Open and click rate analytics",
        "A/B test performance comparison",
        "Subscriber engagement metrics",
        "Unsubscribe and bounce tracking",
        "Send schedule management",
        "Campaign content editor",
      ]}
      relatedLinks={[
        { label: "All Campaigns", href: "/email-campaigns" },
        { label: "Email Inbox", href: "/email-inbox" },
        { label: "Email Templates", href: "/templates/emails" },
      ]}
    />
  );
}
