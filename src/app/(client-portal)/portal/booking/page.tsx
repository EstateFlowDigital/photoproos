import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";

export const dynamic = "force-dynamic";

export default async function PortalBookingPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Book a Session</h1>
        <p className="text-foreground-muted mb-8">Schedule your next photography session</p>

        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
          <p className="text-foreground-muted max-w-md mx-auto mb-8">
            View available times, select services, and book directly through your portal.
          </p>

          <div className="text-left max-w-lg mx-auto mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>View photographer&apos;s available dates and times</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Browse service packages and pricing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Select add-ons and customize your session</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Request specific dates for consideration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Receive instant booking confirmations</span>
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
