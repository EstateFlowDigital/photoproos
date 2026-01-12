"use client";

import { PortalPageWrapper, PortalComingSoon } from "../components";

interface PortalSelectsClientProps {
  clientName?: string;
  clientEmail?: string;
}

export function PortalSelectsClient({
  clientName,
  clientEmail,
}: PortalSelectsClientProps) {
  return (
    <PortalPageWrapper clientName={clientName} clientEmail={clientEmail}>
      <div data-element="portal-selects-page">
        <PortalComingSoon
          title="Your Selects"
          subtitle="Photos selected for editing or print"
          icon="✅"
          description="Review your selected photos and submit for final editing."
          features={[
            "View all selected photos",
            "Organized by session",
            "Edit selection before submitting",
            "Add retouching notes",
            "Track editing progress",
            "Receive notification when ready",
          ]}
          relatedLinks={[
            { label: "Portal Home", href: "/portal" },
            { label: "Proofing", href: "/portal/proofing" },
            { label: "Galleries", href: "/portal/galleries" },
          ]}
        />
      </div>
    </PortalPageWrapper>
  );
}
