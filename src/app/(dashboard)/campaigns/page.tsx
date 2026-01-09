export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function CampaignsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="campaigns-page">
      <PageHeader
        title="Marketing Campaigns"
        subtitle="Plan and track marketing initiatives"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📣</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Create marketing campaigns, track performance, and measure ROI across channels.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Multi-channel campaign management (email, social, ads)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Campaign budget tracking and ROI analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Lead source attribution and conversion tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>A/B testing for messaging and offers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Seasonal campaign templates (mini sessions, holidays)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Performance dashboards and reporting</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/email-campaigns" className="btn btn-secondary text-sm">Email Campaigns</a>
          <a href="/social" className="btn btn-secondary text-sm">Social Media</a>
          <a href="/ads" className="btn btn-secondary text-sm">Ads</a>
        </div>
      </div>
    </div>
  );
}
