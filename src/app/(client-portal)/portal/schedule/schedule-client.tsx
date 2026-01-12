"use client";

import { PortalPageWrapper, PortalComingSoon } from "../components";

interface PortalScheduleClientProps {
  clientName?: string;
  clientEmail?: string;
}

export function PortalScheduleClient({
  clientName,
  clientEmail,
}: PortalScheduleClientProps) {
  return (
    <PortalPageWrapper clientName={clientName} clientEmail={clientEmail}>
      <div data-element="portal-schedule-page">
        <PortalComingSoon
          title="Your Schedule"
          subtitle="View your upcoming and past sessions"
          icon="🗓️"
          description="Calendar view of your scheduled sessions with details and reminders."
          features={[
            "Calendar view of sessions",
            "Upcoming session details",
            "Past session history",
            "Add to personal calendar",
            "Reschedule requests",
            "Session prep reminders",
          ]}
          relatedLinks={[
            { label: "Portal Home", href: "/portal" },
            { label: "Book Session", href: "/portal/booking" },
          ]}
        />
      </div>
    </PortalPageWrapper>
  );
}
