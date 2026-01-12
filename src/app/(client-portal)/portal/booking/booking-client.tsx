"use client";

import { PortalPageWrapper, PortalComingSoon } from "../components";

interface PortalBookingClientProps {
  clientName?: string;
  clientEmail?: string;
}

export function PortalBookingClient({
  clientName,
  clientEmail,
}: PortalBookingClientProps) {
  return (
    <PortalPageWrapper clientName={clientName} clientEmail={clientEmail}>
      <div data-element="portal-booking-page">
        <PortalComingSoon
          title="Book a Session"
          subtitle="Schedule your next photography session"
          icon="📅"
          description="View available times, select services, and book directly through your portal."
          features={[
            "View photographer's available dates and times",
            "Browse service packages and pricing",
            "Select add-ons and customize your session",
            "Request specific dates for consideration",
            "Receive instant booking confirmations",
          ]}
          relatedLinks={[
            { label: "Portal Home", href: "/portal" },
            { label: "Your Schedule", href: "/portal/schedule" },
          ]}
        />
      </div>
    </PortalPageWrapper>
  );
}
