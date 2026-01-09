export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Business analytics and insights"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Comprehensive business reports including revenue, clients, bookings, and team performance.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Reports available:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Revenue reports - income by service, client, and period</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Client reports - acquisition, retention, lifetime value</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Booking reports - session types, peak times, utilization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Team reports - productivity, assignments, payroll</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Profit & loss statements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Tax summaries and deduction tracking</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/reports/revenue" className="btn btn-secondary text-sm">Revenue</a>
          <a href="/reports/clients" className="btn btn-secondary text-sm">Clients</a>
          <a href="/reports/bookings" className="btn btn-secondary text-sm">Bookings</a>
          <a href="/reports/profit-loss" className="btn btn-secondary text-sm">Profit & Loss</a>
        </div>
      </div>
    </div>
  );
}
