import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";

export const dynamic = "force-dynamic";

export default async function PortalDownloadsPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Downloads</h1>
        <p className="text-foreground-muted mb-8">Your download history and available files</p>

        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">⬇️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
          <p className="text-foreground-muted max-w-md mx-auto mb-8">
            Re-download previously purchased files and track download history.
          </p>

          <div className="text-left max-w-lg mx-auto mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>All purchased files in one place</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>High-resolution downloads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Web and print-optimized versions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Download history tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Bulk download options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Cloud storage integration</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a href="/portal/galleries" className="btn btn-secondary text-sm">Galleries</a>
            <a href="/portal/files" className="btn btn-secondary text-sm">Files</a>
            <a href="/portal" className="btn btn-secondary text-sm">Portal Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
