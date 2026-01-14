export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function CommunicationsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Client Communications"
      subtitle="All client communication history"
      icon="📧"
      description="Unified inbox for emails, SMS, and messages with clients across all channels."
      features={[
        "Unified inbox for all channels",
        "Email, SMS, and portal messages",
        "Thread-based conversations",
        "Search across all communications",
        "Attachment management",
        "Communication timeline per client",
      ]}
      relatedLinks={[
        { label: "Email Inbox", href: "/email-inbox" },
        { label: "SMS", href: "/sms" },
        { label: "Messages", href: "/messages" },
      ]}
    />
  );
}
