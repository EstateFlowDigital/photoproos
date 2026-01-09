export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="opportunity-detail-page">
      <PageHeader
        title="Opportunity Details"
        subtitle={`Managing opportunity ${id}`}
        backHref="/opportunities"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">💼</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          View opportunity details, track communications, and manage deal progression.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Deal value and probability tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Pipeline stage management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Activity timeline and notes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Communication history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Convert to booking or project</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Task and follow-up management</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/opportunities" className="btn btn-secondary text-sm">All Opportunities</a>
          <a href="/leads" className="btn btn-secondary text-sm">Leads</a>
          <a href="/proposals" className="btn btn-secondary text-sm">Proposals</a>
        </div>
      </div>
    </div>
  );
}
