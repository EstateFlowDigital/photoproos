export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function CouponsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons & Promo Codes"
        subtitle="Create and manage discount codes"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🏷️</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Create promo codes with limits, expiration dates, and usage tracking.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Percentage or fixed amount discounts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Usage limits (per code or per customer)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Expiration date and start date scheduling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Restrict to specific services or products</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Minimum purchase requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Usage analytics and revenue impact tracking</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/gift-cards" className="btn btn-secondary text-sm">Gift Cards</a>
          <a href="/settings/discounts" className="btn btn-secondary text-sm">Discount Settings</a>
          <a href="/campaigns" className="btn btn-secondary text-sm">Campaigns</a>
        </div>
      </div>
    </div>
  );
}
