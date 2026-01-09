export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function GettingStartedPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Getting Started"
        subtitle="Quick start guide for new users"
        backHref="/help"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🚀</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Step-by-step onboarding guide to set up your account and start booking clients.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Interactive onboarding checklist</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Account setup wizard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Service and pricing configuration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Calendar and availability setup</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>First client and project walkthrough</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Quick tips for productivity</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/help" className="btn btn-secondary text-sm">Help Center</a>
          <a href="/help/videos" className="btn btn-secondary text-sm">Video Tutorials</a>
          <a href="/dashboard" className="btn btn-secondary text-sm">Dashboard</a>
        </div>
      </div>
    </div>
  );
}
