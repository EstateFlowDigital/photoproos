export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ProposalsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proposals"
        subtitle="Create and track client proposals"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📝</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Create professional proposals with pricing packages, terms, and e-signature support.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Branded proposal templates with your logo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Interactive pricing with package options</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Built-in e-signature for instant acceptance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>View tracking (know when clients open proposals)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Automatic invoice creation on acceptance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Expiration dates and follow-up reminders</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/billing/estimates" className="btn btn-secondary text-sm">Estimates</a>
          <a href="/contracts" className="btn btn-secondary text-sm">Contracts</a>
          <a href="/templates/proposals" className="btn btn-secondary text-sm">Templates</a>
        </div>
      </div>
    </div>
  );
}
