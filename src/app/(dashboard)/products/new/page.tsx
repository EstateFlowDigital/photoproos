export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function NewProductPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="New Product"
      subtitle="Create a new service or product"
      icon="➕"
      description="Add new services with pricing, duration, and booking options."
      features={[
        "Product/service type selection",
        "Pricing tiers and variations",
        "Duration and scheduling settings",
        "Category and tag assignment",
        "Image gallery upload",
        "Booking and availability options",
      ]}
      relatedLinks={[
        { label: "All Products", href: "/products" },
        { label: "Services", href: "/services" },
      ]}
    />
  );
}
