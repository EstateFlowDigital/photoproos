import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Surveys | PhotoProOS",
  description: "Create and send surveys to gather client feedback.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function SurveysPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Surveys"
      subtitle="Client satisfaction surveys"
      icon="📊"
      description="Create and send client satisfaction surveys with NPS scoring and analytics."
      features={[
        "Net Promoter Score (NPS) surveys",
        "Custom survey questions and rating scales",
        "Automated send after project completion",
        "Response analytics and trends",
        "Convert positive responses to reviews",
        "Follow-up actions for negative feedback",
      ]}
      relatedLinks={[
        { label: "Reviews", href: "/reviews" },
        { label: "Questionnaires", href: "/questionnaires" },
        { label: "Automations", href: "/automations" },
      ]}
    />
  );
}
