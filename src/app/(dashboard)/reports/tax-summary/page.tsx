export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function TaxSummaryPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="reports-tax-summary-page" className="space-y-6">
      <PageHeader
        title="Tax Summary"
        subtitle="Tax-ready reports and deductions overview"
        backHref="/reports"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Export tax-ready summaries with income, deductions, and quarterly estimates.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Schedule C income summary for self-employment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Deductible expense categories (home office, equipment, travel)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Quarterly estimated tax calculations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>1099 income tracking and reconciliation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Depreciation schedules for equipment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Export to TurboTax, H&R Block, or accountant</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/expenses" className="btn btn-secondary text-sm">Expenses</a>
          <a href="/mileage" className="btn btn-secondary text-sm">Mileage</a>
          <a href="/reports/profit-loss" className="btn btn-secondary text-sm">Profit & Loss</a>
        </div>
      </div>
    </div>
  );
}
