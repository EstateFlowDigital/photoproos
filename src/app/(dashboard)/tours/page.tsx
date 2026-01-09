export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ToursPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Virtual Tours"
        subtitle="Create and manage 3D virtual tours"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🏠</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Build interactive 3D tours with hotspots, floor plan integration, and branded players.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>360° panorama upload and stitching</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Interactive hotspots and navigation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Floor plan integration and dollhouse view</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Branded tour player</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>MLS and website embedding</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Tour analytics and view tracking</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/floor-plans" className="btn btn-secondary text-sm">Floor Plans</a>
          <a href="/galleries" className="btn btn-secondary text-sm">Galleries</a>
          <a href="/projects" className="btn btn-secondary text-sm">Projects</a>
        </div>
      </div>
    </div>
  );
}
