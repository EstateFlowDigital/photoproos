export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MoodBoardDetailPage({ params }: PageProps) {
  const { id } = await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="mood-board-detail-page">
      <PageHeader
        title="Mood Board"
        subtitle={`Board ${id}`}
        backHref="/mood-boards"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📌</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Add images, notes, and color palettes. Share with clients for feedback.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Drag-and-drop image arrangement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Notes and annotations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Color palette extraction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Client collaboration and feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Pinterest import support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Export as PDF or image</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/mood-boards" className="btn btn-secondary text-sm">All Boards</a>
          <a href="/style-guides" className="btn btn-secondary text-sm">Style Guides</a>
        </div>
      </div>
    </div>
  );
}
