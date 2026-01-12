"use client";

import { PortalPageWrapper, PortalComingSoon } from "../components";

interface PortalContractsClientProps {
  clientName?: string;
  clientEmail?: string;
}

export function PortalContractsClient({
  clientName,
  clientEmail,
}: PortalContractsClientProps) {
  return (
    <PortalPageWrapper clientName={clientName} clientEmail={clientEmail}>
      <div data-element="portal-contracts-page">
        <PortalComingSoon
          title="Your Contracts"
          subtitle="View and sign contracts for your projects"
          icon="📜"
          description="View pending contracts, sign digitally, and access signed documents."
          features={[
            "View all pending contracts awaiting signature",
            "Digital signature from any device",
            "Download signed contracts as PDF",
            "View contract history and terms",
            "Email notifications for new contracts",
          ]}
          relatedLinks={[
            { label: "Portal Home", href: "/portal" },
          ]}
        />
      </div>
    </PortalPageWrapper>
  );
}
