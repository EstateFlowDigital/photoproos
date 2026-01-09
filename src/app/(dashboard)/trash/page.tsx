export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function TrashPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="trash-page">
      <PageHeader
        title="Trash"
        subtitle="Recently deleted items"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🗑️</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Restore or permanently delete items. Items auto-delete after 30 days.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>View all deleted items</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>One-click restore functionality</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Permanent deletion option</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>30-day auto-delete policy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Filter by item type (projects, clients, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Storage space recovery tracking</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/archive" className="btn btn-secondary text-sm">Archive</a>
          <a href="/settings/data" className="btn btn-secondary text-sm">Data Settings</a>
          <a href="/storage" className="btn btn-secondary text-sm">Storage</a>
        </div>
      </div>
    </div>
  );
}
