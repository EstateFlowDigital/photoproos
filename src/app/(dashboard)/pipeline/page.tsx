export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function PipelinePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="pipeline-page">
      <ComingSoonPage
        title="Sales Pipeline"
        subtitle="Visualize and manage your sales funnel"
        icon="📈"
        description="Kanban-style pipeline view to track leads from inquiry to booking."
        features={[
          "Drag-and-drop Kanban board for lead management",
          "Customizable pipeline stages (Inquiry → Quoted → Booked → Complete)",
          "Deal value tracking and forecasting",
          "Conversion rate analytics by stage",
          "Automated follow-up reminders",
          "Lead source tracking and ROI analysis",
        ]}
        relatedLinks={[
          { label: "View Leads", href: "/leads" },
          { label: "Opportunities", href: "/opportunities" },
          { label: "Proposals", href: "/proposals" },
        ]}
      />
    </div>
  );
}
