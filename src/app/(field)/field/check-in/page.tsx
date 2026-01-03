export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { CheckInClient } from "./check-in-client";
import { getTodaysBookings } from "@/lib/actions/field-operations";

export const metadata: Metadata = {
  title: "Check In | Field App",
  description: "Quick check-in for your current booking",
};

export default async function CheckInPage() {
  const result = await getTodaysBookings();
  const bookings = result.success ? result.data : [];

  return <CheckInClient bookings={bookings || []} />;
}
