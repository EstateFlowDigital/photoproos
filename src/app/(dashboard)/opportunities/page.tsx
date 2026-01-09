export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function OpportunitiesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        subtitle="Track potential deals and leads"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🎯</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Manage sales opportunities with deal values, probability scores, and follow-up reminders.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Deal value and expected close date tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Win probability scoring and forecasting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Activity timeline (calls, emails, meetings)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Automated follow-up reminders and tasks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Convert opportunities to bookings with one click</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Lost reason tracking for insights</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/pipeline" className="btn btn-secondary text-sm">Sales Pipeline</a>
          <a href="/leads" className="btn btn-secondary text-sm">Leads</a>
          <a href="/proposals" className="btn btn-secondary text-sm">Create Proposal</a>
        </div>
      </div>
    </div>
  );
}
