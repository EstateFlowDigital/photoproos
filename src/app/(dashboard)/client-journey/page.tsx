export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ClientJourneyPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Client Journey"
      subtitle="Visualize the client lifecycle"
      icon="🗺️"
      description="Map touchpoints from inquiry to delivery and identify optimization opportunities."
      features={[
        "Visual journey mapping from inquiry to delivery",
        "Touchpoint tracking and analytics",
        "Drop-off point identification",
        "Time-to-conversion metrics",
        "Client experience scoring",
        "Automation trigger suggestions",
      ]}
      relatedLinks={[
        { label: "Clients", href: "/clients" },
        { label: "Automations", href: "/automations" },
        { label: "Pipeline", href: "/pipeline" },
      ]}
    />
  );
}
