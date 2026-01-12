export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function RevealPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="reveal-page">
      <ComingSoonPage
        title="Reveal & IPS"
        subtitle="In-person sales and reveal galleries"
        icon="🎉"
        description="Create stunning reveal experiences for in-person sales sessions."
        features={[
          "Cinematic reveal presentations with music",
          "In-person sales (IPS) session tools",
          "Wall art visualization and room mockups",
          "Product comparison and upsell suggestions",
          "Real-time order building with clients",
          "Integration with print labs for fulfillment",
        ]}
        relatedLinks={[
          { label: "Galleries", href: "/galleries" },
          { label: "Slideshows", href: "/slideshows" },
          { label: "Wall Art", href: "/wall-art" },
        ]}
      />
    </div>
  );
}
