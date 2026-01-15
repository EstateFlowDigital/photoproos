import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Locations | PhotoProOS",
  description: "Save and manage favorite photography locations.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function LocationsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Locations"
      subtitle="Manage shoot locations and scouting"
      icon="📍"
      description="Save favorite locations with notes, parking info, and best shooting times."
      features={[
        "Location scouting database",
        "GPS coordinates and directions",
        "Best time of day for shooting",
        "Parking and accessibility notes",
        "Sample photos from previous shoots",
        "Permit requirements and contact info",
      ]}
      relatedLinks={[
        { label: "Projects", href: "/projects" },
        { label: "Calendar", href: "/calendar" },
        { label: "Shot List", href: "/shot-list" },
      ]}
    />
  );
}
