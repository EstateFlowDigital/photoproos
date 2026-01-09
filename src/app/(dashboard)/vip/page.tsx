export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function VipPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="vip-page">
      <PageHeader
        title="VIP Clients"
        subtitle="Manage top-tier client relationships"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">👑</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Identify VIP clients, offer exclusive perks, and track high-value relationships.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Automatic VIP status based on spend thresholds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Exclusive perks and priority booking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>VIP-only pricing and discounts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Lifetime value tracking per client</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Anniversary and milestone reminders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>VIP communication templates</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/clients" className="btn btn-secondary text-sm">Clients</a>
          <a href="/loyalty" className="btn btn-secondary text-sm">Loyalty Program</a>
          <a href="/segments" className="btn btn-secondary text-sm">Segments</a>
        </div>
      </div>
    </div>
  );
}
