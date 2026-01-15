import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Templates | PhotoProOS",
  description: "Create and customize email templates for client communication.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function EmailTemplatesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Email Templates"
      subtitle="Create reusable email templates"
      icon="✉️"
      description="Design email templates with variables for automated and manual sending."
      features={[
        "Visual email template builder",
        "Dynamic merge variables (client name, dates, etc.)",
        "Template categories and organization",
        "Preview and test send functionality",
        "Mobile-responsive email designs",
        "Template versioning and history",
      ]}
      relatedLinks={[
        { label: "All Templates", href: "/templates" },
        { label: "Email Inbox", href: "/email-inbox" },
        { label: "Automations", href: "/automations" },
      ]}
    />
  );
}
