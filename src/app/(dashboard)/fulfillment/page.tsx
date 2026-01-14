export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function FulfillmentPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Fulfillment"
      subtitle="Order fulfillment queue"
      icon="✅"
      description="Track order status, manage print lab submissions, and fulfill orders."
      features={[
        "Order fulfillment queue and workflow",
        "Print lab integration (WHCC, Miller's, etc.)",
        "Order status tracking",
        "Batch processing for multiple orders",
        "Client delivery notifications",
        "Fulfillment timeline tracking",
      ]}
      relatedLinks={[
        { label: "Prints", href: "/prints" },
        { label: "Albums", href: "/albums" },
        { label: "Shipping", href: "/shipping" },
      ]}
    />
  );
}
