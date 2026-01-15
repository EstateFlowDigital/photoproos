import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Style Guides | PhotoProOS",
  description: "Define style guides for consistent photography.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function StyleGuidesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Style Guides"
      subtitle="Create client-specific editing style guides"
      icon="🖌️"
      description="Document editing preferences, color palettes, and style notes for consistent delivery."
      features={[
        "Client-specific editing preferences",
        "Color grading reference images",
        "Preset and LUT assignments",
        "Culling and selection criteria",
        "Share with editors and associates",
        "Before/after reference examples",
      ]}
      relatedLinks={[
        { label: "Brand Assets", href: "/assets" },
        { label: "Mood Boards", href: "/mood-boards" },
        { label: "Galleries", href: "/galleries" },
      ]}
    />
  );
}
