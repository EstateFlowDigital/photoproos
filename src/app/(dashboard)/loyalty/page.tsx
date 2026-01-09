export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function LoyaltyPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="loyalty-page" className="space-y-6">
      <PageHeader
        title="Loyalty Program"
        subtitle="Reward repeat clients"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">⭐</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Create points programs, track rewards, and automate loyalty perks.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Points earned per booking or dollar spent</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Tiered rewards (Bronze, Silver, Gold, VIP)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Automatic reward redemption at checkout</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Birthday and anniversary bonuses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Exclusive perks for top-tier members</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Points balance visible in client portal</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/vip" className="btn btn-secondary text-sm">VIP Clients</a>
          <a href="/referrals" className="btn btn-secondary text-sm">Referrals</a>
          <a href="/segments" className="btn btn-secondary text-sm">Segments</a>
        </div>
      </div>
    </div>
  );
}
