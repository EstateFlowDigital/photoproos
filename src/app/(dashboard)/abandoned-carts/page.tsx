export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function AbandonedCartsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="abandoned-carts-page">
      <PageHeader
        title="Abandoned Carts"
        subtitle="Recover lost sales"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          View abandoned carts, send recovery emails, and track conversion rates.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>View incomplete bookings and orders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Automated cart recovery emails</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>One-click recovery with saved cart contents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Incentive offers (discounts, free add-ons)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Recovery rate analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Revenue recovered tracking</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/orders" className="btn btn-secondary text-sm">Orders</a>
          <a href="/automations" className="btn btn-secondary text-sm">Automations</a>
          <a href="/email-campaigns" className="btn btn-secondary text-sm">Email Campaigns</a>
        </div>
      </div>
    </div>
  );
}
