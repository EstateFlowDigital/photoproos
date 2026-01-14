export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function GoogleIntegrationPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Google Integration"
      subtitle="Sync with Google Calendar and Drive"
      icon="🔄"
      description="Two-way sync with Google Calendar, Drive storage, and Gmail integration."
      features={[
        "Two-way Google Calendar sync",
        "Google Drive file storage",
        "Gmail inbox integration",
        "Contact sync with Google Contacts",
        "Google Meet scheduling",
        "Multiple account support",
      ]}
      relatedLinks={[
        { label: "All Integrations", href: "/integrations" },
        { label: "Calendar", href: "/calendar" },
        { label: "Email Inbox", href: "/email-inbox" },
      ]}
    />
  );
}
