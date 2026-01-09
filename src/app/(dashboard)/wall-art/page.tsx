export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function WallArtPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="wall-art-page" className="space-y-6">
      <PageHeader
        title="Wall Art"
        subtitle="Canvas, metal prints, and framed products"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🖼️</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Offer wall art products with room visualization and custom framing options.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Canvas, metal, acrylic, and framed prints</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Room visualization - see art on client&apos;s walls</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Gallery wall and collage designer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Custom frame and mat options</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Size recommendations based on wall space</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Direct lab fulfillment and shipping</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/prints" className="btn btn-secondary text-sm">Prints</a>
          <a href="/albums" className="btn btn-secondary text-sm">Albums</a>
          <a href="/reveal" className="btn btn-secondary text-sm">Reveal Sessions</a>
        </div>
      </div>
    </div>
  );
}
