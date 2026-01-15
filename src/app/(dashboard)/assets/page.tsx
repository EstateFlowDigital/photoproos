import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assets | PhotoProOS",
  description: "Manage digital assets, files, and media for your photography business.",
};

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Brand Assets"
      subtitle="Manage logos, watermarks, and brand materials"
      icon="🎨"
      description="Store and organize brand assets for consistent delivery across all projects."
      features={[
        "Logo and watermark management",
        "Brand color palette storage",
        "Font and typography files",
        "Email signature templates",
        "Social media profile assets",
        "Version history and organization",
      ]}
      relatedLinks={[
        { label: "Style Guides", href: "/style-guides" },
        { label: "Settings", href: "/settings" },
        { label: "Files", href: "/files" },
      ]}
    />
  );
}
