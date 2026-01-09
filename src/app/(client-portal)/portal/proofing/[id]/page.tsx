import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalProofingSessionPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Proofing Session</h1>
        <p className="text-foreground-muted mb-8">Session {id}</p>

        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">✨</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
          <p className="text-foreground-muted max-w-md mx-auto mb-8">
            Review photos, add comments, and submit your final selections for this session.
          </p>

          <div className="text-left max-w-lg mx-auto mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>High-resolution photo viewing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Click to mark favorites</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Add comments and feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Compare photos side-by-side</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Submit final selections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Request retouching changes</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a href="/portal/proofing" className="btn btn-secondary text-sm">All Sessions</a>
            <a href="/portal/selects" className="btn btn-secondary text-sm">Your Selects</a>
            <a href="/portal" className="btn btn-secondary text-sm">Portal Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
