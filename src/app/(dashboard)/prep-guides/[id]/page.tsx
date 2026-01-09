export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrepGuideDetailPage({ params }: PageProps) {
  const { id } = await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="prep-guide-detail-page">
      <PageHeader
        title="Prep Guide"
        subtitle={`Guide ${id}`}
        backHref="/prep-guides"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Edit guide content with images, tips, and downloadable PDF export.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Rich content editor</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Image and gallery embedding</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Tips and recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>PDF export and download</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Client portal sharing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Session type customization</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/prep-guides" className="btn btn-secondary text-sm">All Guides</a>
          <a href="/questionnaires" className="btn btn-secondary text-sm">Questionnaires</a>
        </div>
      </div>
    </div>
  );
}
