export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function WallArtPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="wall-art-page">
      <ComingSoonPage
        title="Wall Art"
        subtitle="Canvas, metal prints, and framed products"
        icon="🖼️"
        description="Offer wall art products with room visualization and custom framing options."
        features={[
          "Canvas, metal, acrylic, and framed prints",
          "Room visualization - see art on client's walls",
          "Gallery wall and collage designer",
          "Custom frame and mat options",
          "Size recommendations based on wall space",
          "Direct lab fulfillment and shipping",
        ]}
        relatedLinks={[
          { label: "Prints", href: "/prints" },
          { label: "Albums", href: "/albums" },
          { label: "Reveal Sessions", href: "/reveal" },
        ]}
      />
    </div>
  );
}
