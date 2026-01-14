export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function WaiversPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Waivers"
      subtitle="Liability waivers and agreements"
      icon="⚠️"
      description="Create and manage liability waivers for adventure, drone, and event photography."
      features={[
        "Liability waiver templates",
        "Adventure/outdoor activity waivers",
        "Drone/aerial photography waivers",
        "E-signature collection",
        "Automatic inclusion with bookings",
        "Signed waiver archive",
      ]}
      relatedLinks={[
        { label: "Contracts", href: "/contracts" },
        { label: "Releases", href: "/releases" },
        { label: "Projects", href: "/projects" },
      ]}
    />
  );
}
