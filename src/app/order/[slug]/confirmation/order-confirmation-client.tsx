"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { verifyOrderPayment, getOrderBySessionToken } from "@/lib/actions/orders";
import {
  CheckCircleOutlineIcon,
  ErrorIcon as OrderErrorIcon,
  PhoneOutlineIcon,
  EmailOutlineIcon,
} from "@/components/ui/icons";

interface OrderPageData {
  id: string;
  name: string;
  slug: string;
  logoOverrideUrl: string | null;
  primaryColor: string | null;
  customPhone: string | null;
  customEmail: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

interface OrderConfirmationClientProps {
  orderPage: OrderPageData;
  orderId?: string;
  sessionId?: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  totalCents: number;
  clientName: string | null;
  clientEmail: string | null;
  items: Array<{
    id: string;
    name: string;
    itemType: string;
    quantity: number;
    totalCents: number;
    sqft: number | null;
    pricingTierName: string | null;
  }>;
  paidAt: Date | null;
  createdAt: Date;
}

export function OrderConfirmationClient({
  orderPage,
  orderId,
  sessionId,
}: OrderConfirmationClientProps) {
  const primaryColor = orderPage.primaryColor || "#3b82f6";
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    async function verifyAndFetchOrder() {
      if (!sessionId) {
        setError("No payment session found");
        setIsLoading(false);
        return;
      }

      try {
        // Verify the payment
        const verifyResult = await verifyOrderPayment(sessionId);

        if (!verifyResult.success) {
          setError(verifyResult.error);
          setIsLoading(false);
          return;
        }

        setPaymentVerified(verifyResult.data.paid);

        // Get the session token from localStorage (set during checkout)
        const sessionToken = localStorage.getItem(`order_${verifyResult.data.orderId}`);

        if (sessionToken) {
          const orderResult = await getOrderBySessionToken(
            verifyResult.data.orderId,
            sessionToken
          );

          if (orderResult.success) {
            setOrderDetails(orderResult.data);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error verifying order:", err);
        setError("Failed to verify your order. Please contact support.");
        setIsLoading(false);
      }
    }

    verifyAndFetchOrder();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" aria-hidden="true" />
          <p className="text-[var(--foreground-secondary)]">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header orderPage={orderPage} />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 p-8">
            <OrderErrorIcon className="mx-auto h-16 w-16 text-[var(--error)]" />
            <h1 className="mt-6 text-2xl font-bold text-white">
              Something went wrong
            </h1>
            <p className="mt-3 text-[var(--foreground-secondary)]">{error}</p>
            <Link
              href={`/order/${orderPage.slug}`}
              className="mt-6 inline-block rounded-lg px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Return to Order Page
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header orderPage={orderPage} />

      <main className="mx-auto max-w-2xl px-6 py-16">
        {/* Success Icon */}
        <div className="text-center">
          <div
            className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <CheckCircleOutlineIcon
              className="h-12 w-12"
              style={{ color: primaryColor }}
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-white">
            {paymentVerified ? "Payment Confirmed!" : "Order Received"}
          </h1>

          <p className="mt-3 text-lg text-[var(--foreground-secondary)]">
            {paymentVerified
              ? "Thank you for your order. We'll be in touch soon!"
              : "Your order is being processed."}
          </p>
        </div>

        {/* Order Details */}
        {orderDetails && (
          <div className="mt-10 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[var(--card-border)] pb-4">
              <h2 className="text-lg font-semibold text-white">Order Details</h2>
              <span className="rounded-full bg-[var(--background-tertiary)] px-3 py-1 text-sm font-medium text-white">
                {orderDetails.orderNumber}
              </span>
            </div>

            {/* Items */}
            <div className="mt-4 space-y-3">
              {orderDetails.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 flex-wrap text-sm"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-[var(--foreground-muted)]">x{item.quantity}</span>
                      )}
                      {item.itemType === "bundle" && (
                        <span className="rounded bg-[var(--background-tertiary)] px-1.5 py-0.5 text-xs text-[var(--foreground-muted)]">
                          Bundle
                        </span>
                      )}
                    </div>
                    {item.sqft && (
                      <span className="text-xs text-[var(--foreground-muted)]">
                        {item.sqft.toLocaleString()} sqft
                        {item.pricingTierName && ` • ${item.pricingTierName}`}
                      </span>
                    )}
                  </div>
                  <span className="text-[var(--foreground-secondary)]">
                    {formatPrice(item.totalCents)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 flex items-start justify-between gap-4 flex-wrap border-t border-[var(--card-border)] pt-4">
              <span className="font-medium text-white">Total</span>
              <span className="text-xl font-bold text-white">
                {formatPrice(orderDetails.totalCents)}
              </span>
            </div>

            {/* Client Info */}
            {(orderDetails.clientName || orderDetails.clientEmail) && (
              <div className="mt-4 border-t border-[var(--card-border)] pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
                  Confirmation sent to
                </p>
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {orderDetails.clientName}
                  {orderDetails.clientEmail && (
                    <> &bull; {orderDetails.clientEmail}</>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="mt-8 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-lg font-semibold text-white">What's Next?</h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                1
              </div>
              <div>
                <p className="font-medium text-white">Confirmation Email</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Check your inbox for order confirmation and receipt
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                2
              </div>
              <div>
                <p className="font-medium text-white">Scheduling</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  We'll reach out to schedule your session at a convenient time
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                3
              </div>
              <div>
                <p className="font-medium text-white">Delivery</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Your photos will be delivered to a private gallery
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        {(orderPage.customPhone || orderPage.customEmail) && (
          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--foreground-muted)]">
              Questions about your order? Contact us:
            </p>
            <div className="mt-2 flex items-center justify-center gap-4">
              {orderPage.customPhone && (
                <a
                  href={`tel:${orderPage.customPhone}`}
                  className="flex items-center gap-1.5 text-sm text-white hover:underline"
                >
                  <PhoneOutlineIcon className="h-4 w-4" />
                  {orderPage.customPhone}
                </a>
              )}
              {orderPage.customEmail && (
                <a
                  href={`mailto:${orderPage.customEmail}`}
                  className="flex items-center gap-1.5 text-sm text-white hover:underline"
                >
                  <EmailOutlineIcon className="h-4 w-4" />
                  {orderPage.customEmail}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Return Link */}
        <div className="mt-10 text-center">
          <Link
            href={`/order/${orderPage.slug}`}
            className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors"
          >
            &larr; Return to {orderPage.organization.name}
          </Link>
        </div>
      </main>
    </div>
  );
}

function Header({ orderPage }: { orderPage: OrderPageData }) {
  return (
    <header className="border-b border-[var(--card-border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-center">
          {orderPage.logoOverrideUrl ? (
            <Image
              src={orderPage.logoOverrideUrl}
              alt={orderPage.organization.name}
              width={140}
              height={40}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <span className="text-xl font-bold text-white">
              {orderPage.organization.name}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
