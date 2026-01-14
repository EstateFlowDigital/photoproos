export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ZapierIntegrationPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Zapier Integration"
      subtitle="Connect to thousands of apps via Zapier"
      icon="⚡"
      description="Automate workflows with 5,000+ apps through Zapier integration."
      features={[
        "Connect to 5,000+ apps and services",
        "Trigger-based workflow automation",
        "Pre-built Zap templates",
        "Multi-step workflow support",
        "Data mapping and transformation",
        "Error handling and notifications",
      ]}
      relatedLinks={[
        { label: "All Integrations", href: "/integrations" },
        { label: "Automations", href: "/automations" },
        { label: "Webhooks", href: "/webhooks" },
      ]}
    />
  );
}
