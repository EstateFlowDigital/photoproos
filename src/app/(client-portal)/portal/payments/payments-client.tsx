"use client";

import { PortalPageWrapper, PortalComingSoon } from "../components";

interface PortalPaymentsClientProps {
  clientName?: string;
  clientEmail?: string;
}

export function PortalPaymentsClient({
  clientName,
  clientEmail,
}: PortalPaymentsClientProps) {
  return (
    <PortalPageWrapper clientName={clientName} clientEmail={clientEmail}>
      <div data-element="portal-payments-page">
        <PortalComingSoon
          title="Payment History"
          subtitle="View all payments and receipts"
          icon="💳"
          description="View payment history, download receipts, and manage payment methods."
          features={[
            "Complete payment history",
            "Downloadable receipts",
            "Outstanding balance view",
            "Saved payment methods",
            "Payment plan tracking",
            "Make payments on invoices",
          ]}
          relatedLinks={[
            { label: "Portal Home", href: "/portal" },
            { label: "Invoices", href: "/portal/invoices" },
          ]}
        />
      </div>
    </PortalPageWrapper>
  );
}
