export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function CollectionsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="collections-page">
      <ComingSoonPage
        title="Collections"
        subtitle="Curated photo collections"
        icon="🎨"
        description="Create themed collections from multiple projects for marketing or portfolio use."
        features={[
          "Curate images from multiple projects",
          "Themed collections (portraits, weddings, etc.)",
          "Portfolio showcase builder",
          "Marketing asset organization",
          "Share collections publicly or privately",
          "Export for social media",
        ]}
        relatedLinks={[
          { label: "Galleries", href: "/galleries" },
          { label: "Projects", href: "/projects" },
          { label: "Social", href: "/social" },
        ]}
      />
    </div>
  );
}
