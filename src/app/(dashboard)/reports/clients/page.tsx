export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ClientsReportPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="reports-clients-page" className="space-y-6">
      <PageHeader
        title="Client Analytics"
        subtitle="Client acquisition and retention metrics"
        backHref="/reports"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">👥</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Client lifetime value, repeat booking rates, and referral tracking.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Client lifetime value tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Repeat booking rates and patterns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Referral source tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Client acquisition costs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Client retention analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Geographic distribution insights</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/reports" className="btn btn-secondary text-sm">All Reports</a>
          <a href="/clients" className="btn btn-secondary text-sm">Clients</a>
          <a href="/referrals" className="btn btn-secondary text-sm">Referrals</a>
        </div>
      </div>
    </div>
  );
}
