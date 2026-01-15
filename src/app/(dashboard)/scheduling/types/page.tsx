import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Types | PhotoProOS",
  description: "Configure different session types and durations.",
};

export const dynamic = "force-dynamic";
import { PageHeader, PageContextNav } from "@/components/dashboard";
import { getBookingTypes, seedDefaultBookingTypes } from "@/lib/actions/booking-types";
import { BookingTypesClient } from "./booking-types-client";

export default async function BookingTypesPage() {
  // Fetch booking types from database
  let bookingTypes = await getBookingTypes();

  // If no booking types exist, seed defaults
  if (bookingTypes.length === 0) {
    await seedDefaultBookingTypes();
    bookingTypes = await getBookingTypes();
  }

  return (
    <div className="space-y-6" data-element="scheduling-types-page">
      <PageHeader
        title="Booking Types"
        subtitle="Manage your booking categories and default durations"
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "Calendar", href: "/scheduling", icon: <CalendarIcon className="h-4 w-4" /> },
          { label: "Availability", href: "/scheduling/availability", icon: <ClockIcon className="h-4 w-4" /> },
          { label: "Booking Types", href: "/scheduling/types", icon: <TagIcon className="h-4 w-4" /> },
        ]}
      />

      <BookingTypesClient bookingTypes={bookingTypes} />
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v3.879a2.5 2.5 0 0 0 .732 1.767l7.5 7.5a2.5 2.5 0 0 0 3.536 0l3.878-3.878a2.5 2.5 0 0 0 0-3.536l-7.5-7.5A2.5 2.5 0 0 0 8.379 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}
