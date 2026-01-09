export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RevealSessionPage({ params }: PageProps) {
  const { id } = await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="reveal-detail-page">
      <PageHeader
        title="Reveal Session"
        subtitle={`Session ${id}`}
        backHref="/reveal"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🖥️</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Present images, track selections, and process orders in real-time.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Full-screen image presentation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Real-time selection tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Client favorites and comments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Instant order processing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Comparison and side-by-side views</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Session summary export</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/reveal" className="btn btn-secondary text-sm">All Sessions</a>
          <a href="/galleries" className="btn btn-secondary text-sm">Galleries</a>
        </div>
      </div>
    </div>
  );
}
