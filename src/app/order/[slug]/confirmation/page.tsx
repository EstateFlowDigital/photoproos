import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrderPageBySlug } from "@/lib/actions/order-pages";
import { OrderConfirmationClient } from "./order-confirmation-client";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string; session_id?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const orderPage = await getOrderPageBySlug(slug);

  if (!orderPage) {
    return { title: "Order Confirmation" };
  }

  return {
    title: `Order Confirmed - ${orderPage.organization.name}`,
    description: "Your order has been confirmed. Thank you for your purchase!",
  };
}

export default async function OrderConfirmationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { order: orderId, session_id: sessionId } = await searchParams;

  const orderPage = await getOrderPageBySlug(slug);

  if (!orderPage) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <p className="text-[var(--foreground-muted)]">Loading confirmation...</p>
          </div>
        </div>
      }
    >
      <OrderConfirmationClient
        orderPage={orderPage}
        orderId={orderId}
        sessionId={sessionId}
      />
    </Suspense>
  );
}
