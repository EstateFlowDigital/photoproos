import { Metadata } from "next";
import { ComingSoonPage } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Resources | PhotoProOS",
  description: "Access photography business resources and guides.",
};

export const dynamic = "force-dynamic";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ResourcesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Resources"
      subtitle="Downloadable guides and templates"
      icon="📚"
      description="Download business templates, pricing guides, and marketing materials."
      features={[
        "Contract and agreement templates",
        "Pricing guide templates",
        "Marketing materials and social templates",
        "Email sequence templates",
        "Business workflow guides",
        "Industry best practices documentation",
      ]}
      relatedLinks={[
        { label: "Getting Started", href: "/help/getting-started" },
        { label: "Templates", href: "/templates" },
        { label: "Video Tutorials", href: "/help/videos" },
      ]}
    />
  );
}
