export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function EmailCampaignsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Email Campaigns"
      subtitle="Create and send email marketing campaigns"
      icon="✉️"
      description="Design email campaigns with templates, schedule sends, and track open rates."
      features={[
        "Drag-and-drop email builder with beautiful templates",
        "Contact segmentation (past clients, leads, VIPs)",
        "Schedule campaigns for optimal send times",
        "Open rates, click tracking, and engagement analytics",
        "Newsletter and promotional campaign templates",
        "Unsubscribe management and compliance",
      ]}
      relatedLinks={[
        { label: "All Campaigns", href: "/campaigns" },
        { label: "Email Templates", href: "/templates/emails" },
        { label: "Client Segments", href: "/segments" },
      ]}
    />
  );
}
