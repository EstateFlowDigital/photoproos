import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping | PhotoProOS",
  description: "Configure shipping options and rates.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ShippingPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Shipping"
      subtitle="Manage shipments and tracking"
      icon="📦"
      description="Create shipping labels, track packages, and manage delivery notifications."
      features={[
        "Shipping label creation (USPS, UPS, FedEx)",
        "Package tracking integration",
        "Delivery notifications to clients",
        "Shipping rate calculator",
        "Address validation",
        "Shipping cost tracking and reports",
      ]}
      relatedLinks={[
        { label: "Fulfillment", href: "/fulfillment" },
        { label: "Prints", href: "/prints" },
        { label: "Products", href: "/products" },
      ]}
    />
  );
}
