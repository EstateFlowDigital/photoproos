"use client";

import { PortalPageWrapper, PortalComingSoon } from "../components";

interface PortalProofingClientProps {
  clientName?: string;
  clientEmail?: string;
}

export function PortalProofingClient({
  clientName,
  clientEmail,
}: PortalProofingClientProps) {
  return (
    <PortalPageWrapper clientName={clientName} clientEmail={clientEmail}>
      <div data-element="portal-proofing-page">
        <PortalComingSoon
          title="Photo Proofing"
          subtitle="Select your favorite photos for editing"
          icon="🖼️"
          description="Browse proofs, mark favorites, and submit your final selections."
          features={[
            "View all proofing sessions",
            "Quick preview gallery",
            "Selection progress tracking",
            "Due date reminders",
            "Share with family members",
            "Download final selections",
          ]}
          relatedLinks={[
            { label: "Portal Home", href: "/portal" },
            { label: "Galleries", href: "/portal/galleries" },
            { label: "Your Selects", href: "/portal/selects" },
          ]}
        />
      </div>
    </PortalPageWrapper>
  );
}
