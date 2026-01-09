export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ReferralsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="referrals-page">
      <PageHeader
        title="Referrals"
        subtitle="Track and reward client referrals"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🎁</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Create referral programs, track referral sources, and automate rewards.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Referral program with custom rewards</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Unique referral links for each client</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Track which clients refer the most</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Automatic reward credits or discounts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Thank you emails for successful referrals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Referral source attribution for leads</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/loyalty" className="btn btn-secondary text-sm">Loyalty Program</a>
          <a href="/reviews" className="btn btn-secondary text-sm">Reviews</a>
          <a href="/campaigns" className="btn btn-secondary text-sm">Campaigns</a>
        </div>
      </div>
    </div>
  );
}
