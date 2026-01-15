import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prep Guides | PhotoProOS",
  description: "Create session prep guides for clients.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function PrepGuidesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Prep Guides"
      subtitle="What-to-wear and session prep guides"
      icon="👗"
      description="Create guides for clothing, makeup, and session preparation to share with clients."
      features={[
        "What-to-wear guides with example photos",
        "Hair and makeup preparation tips",
        "Location-specific preparation advice",
        "Branded PDF generation for sharing",
        "Auto-send based on session type",
        "Templates for families, seniors, maternity, etc.",
      ]}
      relatedLinks={[
        { label: "Mood Boards", href: "/mood-boards" },
        { label: "Questionnaires", href: "/questionnaires" },
        { label: "Automations", href: "/automations" },
      ]}
    />
  );
}
