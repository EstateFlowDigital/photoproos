export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function PrepGuidesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="prep-guides-page">
      <PageHeader
        title="Prep Guides"
        subtitle="What-to-wear and session prep guides"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">👗</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Create guides for clothing, makeup, and session preparation to share with clients.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>What-to-wear guides with example photos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Hair and makeup preparation tips</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Location-specific preparation advice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Branded PDF generation for sharing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Auto-send based on session type</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Templates for families, seniors, maternity, etc.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/mood-boards" className="btn btn-secondary text-sm">Mood Boards</a>
          <a href="/questionnaires" className="btn btn-secondary text-sm">Questionnaires</a>
          <a href="/automations" className="btn btn-secondary text-sm">Automations</a>
        </div>
      </div>
    </div>
  );
}
