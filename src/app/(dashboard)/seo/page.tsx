export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function SeoPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="SEO"
      subtitle="Search engine optimization settings"
      icon="🔍"
      description="Optimize your site for search engines with meta tags, sitemaps, and analytics."
      features={[
        "Meta title and description management",
        "Automatic sitemap generation",
        "Google Search Console integration",
        "Keyword tracking and suggestions",
        "Image alt text optimization",
        "SEO score and recommendations",
      ]}
      relatedLinks={[
        { label: "Blog", href: "/blog" },
        { label: "Landing Pages", href: "/landing-pages" },
        { label: "Settings", href: "/settings" },
      ]}
    />
  );
}
