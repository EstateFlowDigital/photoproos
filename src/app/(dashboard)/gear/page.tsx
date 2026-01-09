export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function GearPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="gear-page" className="space-y-6">
      <PageHeader
        title="Gear"
        subtitle="Equipment inventory and tracking"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📷</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Track cameras, lenses, lighting, and accessories with serial numbers and insurance values.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Complete equipment inventory with photos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Serial numbers and purchase dates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Insurance values and depreciation tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Maintenance schedules and service history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Gear kit presets for different shoot types</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Equipment checkout for team members</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/gear/maintenance" className="btn btn-secondary text-sm">Maintenance</a>
          <a href="/rentals" className="btn btn-secondary text-sm">Rentals</a>
          <a href="/expenses" className="btn btn-secondary text-sm">Expenses</a>
        </div>
      </div>
    </div>
  );
}
