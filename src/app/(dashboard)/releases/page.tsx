export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ReleasesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Releases"
        subtitle="Model and property release forms"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Manage model releases, property releases, and talent agreements with e-signatures.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Model release templates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Property release forms</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Minor/guardian consent forms</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>E-signature collection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Link to specific projects</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>PDF export and secure storage</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/contracts" className="btn btn-secondary text-sm">Contracts</a>
          <a href="/waivers" className="btn btn-secondary text-sm">Waivers</a>
          <a href="/licenses" className="btn btn-secondary text-sm">Licenses</a>
        </div>
      </div>
    </div>
  );
}
