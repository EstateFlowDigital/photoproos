import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { DigitalProductsClient } from "./digital-products-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Products | PhotoProOS",
  description: "Sell digital products like presets, guides, and templates to clients.",
};

export const dynamic = "force-dynamic";

export default async function DigitalProductsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="digital-products-page">
      <PageHeader
        title="Digital Products"
        subtitle="Sell presets, guides, and digital downloads"
      />

      <DigitalProductsClient />
    </div>
  );
}
