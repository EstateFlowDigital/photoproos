export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ProofingPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="proofing-page">
      <PageHeader
        title="Proofing Sessions"
        subtitle="Client photo selection and proofing"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">✨</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Create proofing sessions for clients to select favorites and request edits.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Selection limits to help clients choose</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Favorite, reject, and maybe categories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Comment threads on individual images</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Side-by-side comparison view</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Export selections to Lightroom or Capture One</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Deadline reminders for pending selections</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/galleries" className="btn btn-secondary text-sm">Galleries</a>
          <a href="/portal/proofing" className="btn btn-secondary text-sm">Client Portal</a>
          <a href="/orders" className="btn btn-secondary text-sm">Orders</a>
        </div>
      </div>
    </div>
  );
}
