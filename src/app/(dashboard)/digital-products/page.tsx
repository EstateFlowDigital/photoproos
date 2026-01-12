export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function DigitalProductsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="digital-products-page">
      <ComingSoonPage
        title="Digital Products"
        subtitle="Sell presets, guides, and digital downloads"
        icon="💾"
        description="Create and sell Lightroom presets, LUTs, guides, and other digital products."
        features={[
          "Sell Lightroom presets and LUTs",
          "PDF guides and educational resources",
          "Secure download delivery",
          "License key generation",
          "Bundle products together",
          "Sales analytics and reporting",
        ]}
        relatedLinks={[
          { label: "Products", href: "/products" },
          { label: "Courses", href: "/courses" },
          { label: "Invoices", href: "/invoices" },
        ]}
      />
    </div>
  );
}
