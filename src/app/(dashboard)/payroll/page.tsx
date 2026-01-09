export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function PayrollPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        subtitle="Process contractor and employee payments"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">💵</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Run payroll, track contractor payments, and manage compensation records.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Contractor payment processing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Automatic pay calculations from timesheets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Direct deposit and check payments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>1099 and W-9 document management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Payment history and records</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Year-end tax reporting</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/timesheets" className="btn btn-secondary text-sm">Timesheets</a>
          <a href="/associates" className="btn btn-secondary text-sm">Associates</a>
          <a href="/commissions" className="btn btn-secondary text-sm">Commissions</a>
        </div>
      </div>
    </div>
  );
}
