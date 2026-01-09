export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function SocialPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="social-page" className="space-y-6">
      <PageHeader
        title="Social Media"
        subtitle="Manage social media content and scheduling"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📱</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Schedule posts, track engagement, and manage multiple social accounts in one place.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Connect Instagram, Facebook, Pinterest, and more</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Visual content calendar with drag-and-drop scheduling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Auto-post from galleries with client permission</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Best time to post recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Engagement analytics and follower growth tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Hashtag suggestions and caption templates</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/content" className="btn btn-secondary text-sm">Content Calendar</a>
          <a href="/galleries" className="btn btn-secondary text-sm">Galleries</a>
          <a href="/campaigns" className="btn btn-secondary text-sm">Campaigns</a>
        </div>
      </div>
    </div>
  );
}
