export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function LocationsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="locations-page">
      <PageHeader
        title="Locations"
        subtitle="Manage shoot locations and scouting"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📍</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Save favorite locations with notes, parking info, and best shooting times.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Location scouting database</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>GPS coordinates and directions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Best time of day for shooting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Parking and accessibility notes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Sample photos from previous shoots</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Permit requirements and contact info</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/projects" className="btn btn-secondary text-sm">Projects</a>
          <a href="/calendar" className="btn btn-secondary text-sm">Calendar</a>
          <a href="/shot-list" className="btn btn-secondary text-sm">Shot List</a>
        </div>
      </div>
    </div>
  );
}
