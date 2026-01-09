import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";

export const dynamic = "force-dynamic";

export default async function PortalContractsPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Your Contracts</h1>
        <p className="text-foreground-muted mb-8">View and sign contracts for your projects</p>

        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📜</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
          <p className="text-foreground-muted max-w-md mx-auto mb-8">
            View pending contracts, sign digitally, and access signed documents.
          </p>

          <div className="text-left max-w-lg mx-auto mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>View all pending contracts awaiting signature</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Digital signature from any device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Download signed contracts as PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>View contract history and terms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Email notifications for new contracts</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a href="/portal" className="btn btn-secondary text-sm">Back to Portal</a>
          </div>
        </div>
      </div>
    </div>
  );
}
