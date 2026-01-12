export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function SneakPeeksPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="sneak-peeks-page">
      <ComingSoonPage
        title="Sneak Peeks"
        subtitle="Quick preview galleries for clients"
        icon="👀"
        description="Share quick previews before full gallery delivery to build excitement."
        features={[
          "Quick-select images from full gallery",
          "Same-day sneak peek delivery option",
          "Social media-optimized image sizes",
          "Branded preview pages with your logo",
          "Automatic email notification to clients",
          "Social sharing permissions and credits",
        ]}
        relatedLinks={[
          { label: "Galleries", href: "/galleries" },
          { label: "Slideshows", href: "/slideshows" },
          { label: "Social Media", href: "/social" },
        ]}
      />
    </div>
  );
}
