export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function AutomationsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="automations-page">
      <ComingSoonPage
        title="Automations"
        subtitle="Automated actions and triggers"
        icon="🤖"
        description="Set up automatic emails, reminders, task assignments, and status updates based on triggers."
        features={[
          "Auto-send questionnaires after booking",
          "Payment reminder emails (1 day, 3 days, 7 days before)",
          "Session reminder notifications to clients",
          "Thank you emails after gallery delivery",
          "Review request emails after project completion",
          "Birthday and anniversary greetings",
        ]}
        relatedLinks={[
          { label: "Workflows", href: "/workflows" },
          { label: "Email Templates", href: "/templates/emails" },
          { label: "Email Settings", href: "/settings/email" },
        ]}
      />
    </div>
  );
}
