export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ProfitLossPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit & Loss"
        subtitle="View your business income and expenses"
        backHref="/reports"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Generate profit and loss statements with revenue, expenses, and net income analysis.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Revenue breakdown by service type and client</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Expense categorization and analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Gross and net profit margins</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Monthly, quarterly, and annual comparisons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Year-over-year growth tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Export for accountants (PDF, Excel)</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/reports/revenue" className="btn btn-secondary text-sm">Revenue Report</a>
          <a href="/expenses" className="btn btn-secondary text-sm">Expenses</a>
          <a href="/reports/tax-summary" className="btn btn-secondary text-sm">Tax Summary</a>
        </div>
      </div>
    </div>
  );
}
