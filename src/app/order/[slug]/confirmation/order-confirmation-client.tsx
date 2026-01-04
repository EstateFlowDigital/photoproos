"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { verifyOrderPayment, getOrderBySessionToken } from "@/lib/actions/orders";

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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
          <p className="text-[#a7a7a7]">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header orderPage={orderPage} />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8">
            <ErrorIcon className="mx-auto h-16 w-16 text-red-400" />
            <h1 className="mt-6 text-2xl font-bold text-white">
              Something went wrong
            </h1>
            <p className="mt-3 text-[#a7a7a7]">{error}</p>
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header orderPage={orderPage} />

      <main className="mx-auto max-w-2xl px-6 py-16">
        {/* Success Icon */}
        <div className="text-center">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <CheckCircleIcon
              className="h-12 w-12"
              style={{ color: primaryColor }}
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-white">
            {paymentVerified ? "Payment Confirmed!" : "Order Received"}
          </h1>

          <p className="mt-3 text-lg text-[#a7a7a7]">
            {paymentVerified
              ? "Thank you for your order. We'll be in touch soon!"
              : "Your order is being processed."}
          </p>
        </div>

        {/* Order Details */}
        {orderDetails && (
          <div className="mt-10 rounded-xl border border-[#262626] bg-[#141414] p-6">
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <h2 className="text-lg font-semibold text-white">Order Details</h2>
              <span className="rounded-full bg-[#262626] px-3 py-1 text-sm font-medium text-white">
                {orderDetails.orderNumber}
              </span>
            </div>

            {/* Items */}
            <div className="mt-4 space-y-3">
              {orderDetails.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between text-sm"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-[#7c7c7c]">x{item.quantity}</span>
                      )}
                      {item.itemType === "bundle" && (
                        <span className="rounded bg-[#262626] px-1.5 py-0.5 text-xs text-[#7c7c7c]">
                          Bundle
                        </span>
                      )}
                    </div>
                    {item.sqft && (
                      <span className="text-xs text-[#7c7c7c]">
                        {item.sqft.toLocaleString()} sqft
                        {item.pricingTierName && ` • ${item.pricingTierName}`}
                      </span>
                    )}
                  </div>
                  <span className="text-[#a7a7a7]">
                    {formatPrice(item.totalCents)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 flex items-center justify-between border-t border-[#262626] pt-4">
              <span className="font-medium text-white">Total</span>
              <span className="text-xl font-bold text-white">
                {formatPrice(orderDetails.totalCents)}
              </span>
            </div>

            {/* Client Info */}
            {(orderDetails.clientName || orderDetails.clientEmail) && (
              <div className="mt-4 border-t border-[#262626] pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[#7c7c7c] mb-2">
                  Confirmation sent to
                </p>
                <p className="text-sm text-[#a7a7a7]">
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
        <div className="mt-8 rounded-xl border border-[#262626] bg-[#141414] p-6">
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
                <p className="text-sm text-[#7c7c7c]">
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
                <p className="text-sm text-[#7c7c7c]">
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
                <p className="text-sm text-[#7c7c7c]">
                  Your photos will be delivered to a private gallery
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        {(orderPage.customPhone || orderPage.customEmail) && (
          <div className="mt-8 text-center">
            <p className="text-sm text-[#7c7c7c]">
              Questions about your order? Contact us:
            </p>
            <div className="mt-2 flex items-center justify-center gap-4">
              {orderPage.customPhone && (
                <a
                  href={`tel:${orderPage.customPhone}`}
                  className="flex items-center gap-1.5 text-sm text-white hover:underline"
                >
                  <PhoneIcon className="h-4 w-4" />
                  {orderPage.customPhone}
                </a>
              )}
              {orderPage.customEmail && (
                <a
                  href={`mailto:${orderPage.customEmail}`}
                  className="flex items-center gap-1.5 text-sm text-white hover:underline"
                >
                  <EmailIcon className="h-4 w-4" />
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
            className="text-sm text-[#7c7c7c] hover:text-white transition-colors"
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
    <header className="border-b border-[#262626] bg-[#141414]">
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

function CheckCircleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      style={style}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}
