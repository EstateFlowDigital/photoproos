export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function SmsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="SMS Messaging"
      subtitle="Send and receive text messages with clients"
      icon="📱"
      description="Two-way SMS with clients, automated reminders, and conversation history."
      features={[
        "Two-way SMS messaging with clients",
        "Automated appointment reminders",
        "SMS templates with variables",
        "Conversation history per client",
        "Delivery status and read receipts",
        "Business phone number management",
      ]}
      relatedLinks={[
        { label: "Communications", href: "/communications" },
        { label: "Automations", href: "/automations" },
        { label: "Clients", href: "/clients" },
      ]}
    />
  );
}
