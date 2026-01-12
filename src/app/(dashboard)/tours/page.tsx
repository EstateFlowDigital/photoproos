export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ToursPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="tours-page">
      <ComingSoonPage
        title="Virtual Tours"
        subtitle="Create and manage 3D virtual tours"
        icon="🏠"
        description="Build interactive 3D tours with hotspots, floor plan integration, and branded players."
        features={[
          "360° panorama upload and stitching",
          "Interactive hotspots and navigation",
          "Floor plan integration and dollhouse view",
          "Branded tour player",
          "MLS and website embedding",
          "Tour analytics and view tracking",
        ]}
        relatedLinks={[
          { label: "Floor Plans", href: "/floor-plans" },
          { label: "Galleries", href: "/galleries" },
          { label: "Projects", href: "/projects" },
        ]}
      />
    </div>
  );
}
