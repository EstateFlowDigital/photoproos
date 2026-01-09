import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";

export const dynamic = "force-dynamic";

export default async function PortalFilesPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-background" data-element="portal-files-page">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Your Files</h1>
        <p className="text-foreground-muted mb-8">Access all your project files and documents</p>

        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📁</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
          <p className="text-foreground-muted max-w-md mx-auto mb-8">
            Download project files, view documents, and access shared materials.
          </p>

          <div className="text-left max-w-lg mx-auto mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Project documents and files</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Contracts and agreements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Prep guides and instructions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Mood boards and inspiration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Secure file downloads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>File upload for sharing</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a href="/portal/downloads" className="btn btn-secondary text-sm">Downloads</a>
            <a href="/portal/projects" className="btn btn-secondary text-sm">Projects</a>
            <a href="/portal" className="btn btn-secondary text-sm">Portal Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
