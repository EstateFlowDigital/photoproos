export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DigitalProductDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Digital Product"
      subtitle="Product details and sales"
      icon="📦"
      description="Edit product details, upload files, set pricing, and track sales."
      features={[
        "Product details editor",
        "File upload and management",
        "Pricing and discount settings",
        "Sales and download tracking",
        "Customer reviews and ratings",
        "License and usage terms",
      ]}
      relatedLinks={[
        { label: "All Products", href: "/digital-products" },
        { label: "Orders", href: "/orders" },
      ]}
    />
  );
}
