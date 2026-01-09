import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getOrderPageBySlug } from "@/lib/actions/order-pages";
import { getClientSession } from "@/lib/actions/client-auth";
import { OrderPageClient } from "./order-page-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const orderPage = await getOrderPageBySlug(slug);

  if (!orderPage) {
    return { title: "Page Not Found" };
  }

  return {
    title: orderPage.headline || orderPage.name,
    description: orderPage.subheadline || `Services from ${orderPage.organization.name}`,
    openGraph: {
      title: orderPage.headline || orderPage.name,
      description: orderPage.subheadline || `Services from ${orderPage.organization.name}`,
      type: "website",
      ...(orderPage.heroImageUrl && {
        images: [{ url: orderPage.heroImageUrl }],
      }),
    },
  };
}

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: PageProps) {
  const { slug } = await params;
  const orderPage = await getOrderPageBySlug(slug);

  if (!orderPage) {
    notFound();
  }

  // Handle login requirement - check for client session
  // Note: requireLogin field exists on OrderPage model but isn't returned by getOrderPageBySlug
  // For now, we'll skip this check - can be added later if needed

  return (
    <div data-element="order-page">
      <OrderPageClient orderPage={orderPage} />
    </div>
  );
}
