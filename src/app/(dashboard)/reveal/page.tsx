export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function RevealPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="reveal-page">
      <PageHeader
        title="Reveal & IPS"
        subtitle="In-person sales and reveal galleries"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Create stunning reveal experiences for in-person sales sessions.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Cinematic reveal presentations with music</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>In-person sales (IPS) session tools</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Wall art visualization and room mockups</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Product comparison and upsell suggestions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Real-time order building with clients</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Integration with print labs for fulfillment</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/galleries" className="btn btn-secondary text-sm">Galleries</a>
          <a href="/slideshows" className="btn btn-secondary text-sm">Slideshows</a>
          <a href="/wall-art" className="btn btn-secondary text-sm">Wall Art</a>
        </div>
      </div>
    </div>
  );
}
