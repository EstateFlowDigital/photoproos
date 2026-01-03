export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { FieldScheduleClient } from "./field-schedule-client";
import { getTodaysBookings, getUpcomingBookings } from "@/lib/actions/field-operations";

export const metadata: Metadata = {
  title: "Today's Schedule | Field App",
  description: "View and manage today's photography bookings",
};

export default async function FieldSchedulePage() {
  const [todayResult, upcomingResult] = await Promise.all([
    getTodaysBookings(),
    getUpcomingBookings(7),
  ]);

  const todaysBookings = todayResult.success ? todayResult.data : [];
  const upcomingBookings = upcomingResult.success ? upcomingResult.data : [];

  return (
    <FieldScheduleClient
      todaysBookings={todaysBookings || []}
      upcomingBookings={upcomingBookings || []}
    />
  );
}
