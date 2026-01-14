export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function AerialPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Aerial & Drone"
      subtitle="Manage drone photography and video projects"
      icon="🚁"
      description="Track drone flights, manage FAA compliance, and organize aerial media."
      features={[
        "Drone flight logging and tracking",
        "FAA Part 107 compliance management",
        "Airspace authorization tracking (LAANC)",
        "Weather conditions logging",
        "Equipment maintenance records",
        "Aerial media organization",
      ]}
      relatedLinks={[
        { label: "Projects", href: "/projects" },
        { label: "Virtual Tours", href: "/tours" },
        { label: "Gear", href: "/gear" },
      ]}
    />
  );
}
