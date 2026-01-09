export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function RefundsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="refunds-page">
      <PageHeader
        title="Refunds"
        subtitle="Process and track refunds"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">💸</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Process refunds, track refund history, and manage refund policies.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Full and partial refund processing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Refund reason tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Automatic Stripe/Square integration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Refund policy templates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Client notification emails</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Refund reports and analytics</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/payments" className="btn btn-secondary text-sm">Payments</a>
          <a href="/invoices" className="btn btn-secondary text-sm">Invoices</a>
          <a href="/reports" className="btn btn-secondary text-sm">Reports</a>
        </div>
      </div>
    </div>
  );
}
