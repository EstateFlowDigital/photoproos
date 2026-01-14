export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function NewSurveyPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="New Survey"
      subtitle="Create a new client survey"
      icon="➕"
      description="Build custom surveys with rating scales, multiple choice, and open-ended questions."
      features={[
        "Drag-and-drop survey builder",
        "Multiple question types (rating, choice, text)",
        "Conditional logic and branching",
        "Pre-built survey templates",
        "Custom branding options",
        "Automated distribution settings",
      ]}
      relatedLinks={[
        { label: "All Surveys", href: "/surveys" },
        { label: "Questionnaires", href: "/questionnaires" },
      ]}
    />
  );
}
