"use client";

import { PortalPageWrapper, PortalComingSoon } from "../../components";

interface PortalProofingSessionClientProps {
  sessionId: string;
  clientName?: string;
  clientEmail?: string;
}

export function PortalProofingSessionClient({
  sessionId,
  clientName,
  clientEmail,
}: PortalProofingSessionClientProps) {
  return (
    <PortalPageWrapper clientName={clientName} clientEmail={clientEmail}>
      <div data-element="portal-proofing-session-page">
        <PortalComingSoon
          title="Proofing Session"
          subtitle={`Session ${sessionId}`}
          icon="✨"
          description="Review photos, add comments, and submit your final selections for this session."
          features={[
            "High-resolution photo viewing",
            "Click to mark favorites",
            "Add comments and feedback",
            "Compare photos side-by-side",
            "Submit final selections",
            "Request retouching changes",
          ]}
          relatedLinks={[
            { label: "All Sessions", href: "/portal/proofing" },
            { label: "Your Selects", href: "/portal/selects" },
            { label: "Portal Home", href: "/portal" },
          ]}
        />
      </div>
    </PortalPageWrapper>
  );
}
