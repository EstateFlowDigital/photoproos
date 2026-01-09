export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function PipelinePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="pipeline-page">
      <PageHeader
        title="Sales Pipeline"
        subtitle="Visualize and manage your sales funnel"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📈</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Kanban-style pipeline view to track leads from inquiry to booking.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Drag-and-drop Kanban board for lead management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Customizable pipeline stages (Inquiry → Quoted → Booked → Complete)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Deal value tracking and forecasting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Conversion rate analytics by stage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Automated follow-up reminders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Lead source tracking and ROI analysis</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/leads" className="btn btn-secondary text-sm">View Leads</a>
          <a href="/opportunities" className="btn btn-secondary text-sm">Opportunities</a>
          <a href="/proposals" className="btn btn-secondary text-sm">Proposals</a>
        </div>
      </div>
    </div>
  );
}
