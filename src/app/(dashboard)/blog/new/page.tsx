export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function NewBlogPostPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Blog Post"
        subtitle="Create a new blog post"
        backHref="/blog"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">➕</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Write and publish blog content with AI-assisted writing and SEO optimization.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Rich text editor with formatting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>AI writing assistance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>SEO optimization tools</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Image and gallery embedding</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Draft saving and scheduling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Category and tag management</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/blog" className="btn btn-secondary text-sm">All Posts</a>
          <a href="/seo" className="btn btn-secondary text-sm">SEO Settings</a>
        </div>
      </div>
    </div>
  );
}
