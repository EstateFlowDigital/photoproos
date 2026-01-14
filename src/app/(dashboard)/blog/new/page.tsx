export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function NewBlogPostPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="New Blog Post"
      subtitle="Create a new blog post"
      icon="➕"
      description="Write and publish blog content with AI-assisted writing and SEO optimization."
      features={[
        "Rich text editor with formatting",
        "AI writing assistance",
        "SEO optimization tools",
        "Image and gallery embedding",
        "Draft saving and scheduling",
        "Category and tag management",
      ]}
      relatedLinks={[
        { label: "All Posts", href: "/blog" },
        { label: "SEO Settings", href: "/seo" },
      ]}
    />
  );
}
