import { Metadata } from "next";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Floor Plans | PhotoProOS",
  description: "Manage floor plans for real estate photography.",
};

export const dynamic = "force-dynamic";

export default async function FloorPlansPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Floor Plans"
      subtitle="Create and manage property floor plans"
      icon="📐"
      description="Generate 2D and 3D floor plans with measurements and room labels."
      features={[
        "2D and 3D floor plan generation",
        "Accurate measurements and dimensions",
        "Room labels and square footage",
        "Multiple export formats (PDF, JPG, PNG)",
        "Integration with virtual tours",
        "Branded floor plan templates",
      ]}
      relatedLinks={[
        { label: "Virtual Tours", href: "/tours" },
        { label: "Aerial", href: "/aerial" },
        { label: "Projects", href: "/projects" },
      ]}
    />
  );
}
