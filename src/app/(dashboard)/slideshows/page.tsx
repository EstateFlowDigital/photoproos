export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function SlideshowsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="slideshows-page" className="space-y-6">
      <PageHeader
        title="Slideshows"
        subtitle="Create and share photo slideshows"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🎬</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Build beautiful slideshows with music, transitions, and shareable links.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Drag-and-drop slideshow builder</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Licensed music library for commercial use</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Professional transitions and animations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Shareable links for clients and social media</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Download as video file (MP4)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Embed on websites and blogs</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/galleries" className="btn btn-secondary text-sm">Galleries</a>
          <a href="/sneak-peeks" className="btn btn-secondary text-sm">Sneak Peeks</a>
          <a href="/reveal" className="btn btn-secondary text-sm">Reveal Sessions</a>
        </div>
      </div>
    </div>
  );
}
