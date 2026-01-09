export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function FilesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="files-page" className="space-y-6">
      <PageHeader
        title="Files"
        subtitle="Manage all your uploaded files"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📁</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          File manager with folders, search, and bulk operations.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Folder organization and hierarchy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Search across all uploaded files</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Bulk move, rename, and delete</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>File preview and metadata</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Storage usage tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Duplicate file detection</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/storage" className="btn btn-secondary text-sm">Storage</a>
          <a href="/galleries" className="btn btn-secondary text-sm">Galleries</a>
          <a href="/backups" className="btn btn-secondary text-sm">Backups</a>
        </div>
      </div>
    </div>
  );
}
