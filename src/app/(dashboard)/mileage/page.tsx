export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function MileagePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="mileage-page">
      <PageHeader
        title="Mileage Tracking"
        subtitle="Log and track business mileage for tax deductions"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🚗</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Track mileage for client visits, auto-calculate IRS rates, and export for tax filing.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>GPS-based automatic trip tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>IRS standard mileage rate calculations (updated annually)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Link trips to specific clients and projects</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Business vs. personal trip categorization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Monthly and annual mileage summaries</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Export mileage logs for tax deductions</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/expenses" className="btn btn-secondary text-sm">Track Expenses</a>
          <a href="/reports/tax-summary" className="btn btn-secondary text-sm">Tax Summary</a>
          <a href="/scheduling" className="btn btn-secondary text-sm">View Schedule</a>
        </div>
      </div>
    </div>
  );
}
