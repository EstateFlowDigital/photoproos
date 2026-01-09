import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";

export const dynamic = "force-dynamic";

export default async function PortalProofingPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Photo Proofing</h1>
        <p className="text-foreground-muted mb-8">Select your favorite photos for editing</p>

        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">🖼️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
          <p className="text-foreground-muted max-w-md mx-auto mb-8">
            Browse proofs, mark favorites, and submit your final selections.
          </p>

          <div className="text-left max-w-lg mx-auto mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>View all proofing sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Quick preview gallery</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Selection progress tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Due date reminders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Share with family members</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Download final selections</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a href="/portal/galleries" className="btn btn-secondary text-sm">Galleries</a>
            <a href="/portal/selects" className="btn btn-secondary text-sm">Your Selects</a>
            <a href="/portal" className="btn btn-secondary text-sm">Portal Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
