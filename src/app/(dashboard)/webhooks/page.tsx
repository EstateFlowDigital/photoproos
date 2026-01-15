import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webhooks | PhotoProOS",
  description: "Configure webhook endpoints for custom integrations.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function WebhooksPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Webhooks"
      subtitle="Configure webhook endpoints"
      icon="🪝"
      description="Set up webhooks to notify external systems of events in your account."
      features={[
        "Custom webhook endpoint configuration",
        "Event type selection (bookings, payments, etc.)",
        "Webhook signing and verification",
        "Delivery logs and retry management",
        "Test webhook functionality",
        "Payload customization options",
      ]}
      relatedLinks={[
        { label: "API Keys", href: "/api-keys" },
        { label: "Integrations", href: "/integrations" },
        { label: "Automations", href: "/automations" },
      ]}
    />
  );
}
