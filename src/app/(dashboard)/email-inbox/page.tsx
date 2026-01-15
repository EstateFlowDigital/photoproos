import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Inbox | PhotoProOS",
  description: "Manage incoming emails from clients.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function EmailInboxPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Email Inbox"
      subtitle="Manage client emails in one place"
      icon="📬"
      description="Integrated email inbox with client matching, templates, and tracking."
      features={[
        "Unified inbox for all client emails",
        "Automatic client matching and threading",
        "Email templates with merge variables",
        "Open and click tracking",
        "Attachment handling and preview",
        "Email scheduling and follow-up reminders",
      ]}
      relatedLinks={[
        { label: "Communications", href: "/communications" },
        { label: "Email Templates", href: "/templates/emails" },
        { label: "Clients", href: "/clients" },
      ]}
    />
  );
}
