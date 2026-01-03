export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { SchedulingPageClient } from "./scheduling-page-client";
import { getPendingTimeOffCount } from "@/lib/actions/availability";

// Helper to check if date is today
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export default async function SchedulingPage() {
  // Get authenticated user and organization
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please create an organization to get started.</p>
      </div>
    );
  }

  // Fetch upcoming bookings, clients, time-off blocks, and check for calendar integrations
  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  const [bookings, clients, calendarIntegration, timeOffBlocks, pendingTimeOffResult] = await Promise.all([
    prisma.booking.findMany({
      where: {
        organizationId: organization.id,
        startTime: { gte: now },
        status: { not: "cancelled" },
      },
      include: {
        client: { select: { fullName: true, company: true } },
      },
      orderBy: { startTime: "asc" },
      take: 100,
    }),
    prisma.client.findMany({
      where: { organizationId: organization.id },
      select: {
        id: true,
        fullName: true,
        company: true,
        email: true,
      },
      orderBy: { fullName: "asc" },
      take: 50,
    }),
    prisma.calendarIntegration.findFirst({
      where: {
        organizationId: organization.id,
        provider: "google",
        syncEnabled: true,
      },
      select: { id: true },
    }),
    // Fetch approved time-off blocks for display on calendar
    prisma.availabilityBlock.findMany({
      where: {
        organizationId: organization.id,
        blockType: { in: ["time_off", "holiday", "personal"] },
        requestStatus: "approved",
        endDate: { gte: now },
        startDate: { lte: threeMonthsFromNow },
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        allDay: true,
        blockType: true,
        userId: true,
      },
      orderBy: { startDate: "asc" },
    }),
    // Get count of pending time-off requests for badge
    getPendingTimeOffCount(),
  ]);

  const pendingTimeOffCount = pendingTimeOffResult.success ? pendingTimeOffResult.data : 0;

  // Generate mini calendar for current week
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dayBookings = bookings.filter(
      (b) => b.startTime.toDateString() === date.toDateString()
    );
    return {
      date,
      dayName: weekDays[i],
      dayNumber: date.getDate(),
      isToday: isToday(date),
      hasBooking: dayBookings.length > 0,
      bookingCount: dayBookings.length,
    };
  });

  return (
    <div className="space-y-6">
      <SchedulingPageClient
        clients={clients}
        bookings={bookings}
        calendarDays={calendarDays}
        isGoogleCalendarConnected={!!calendarIntegration}
        timeOffBlocks={timeOffBlocks}
        pendingTimeOffCount={pendingTimeOffCount}
      />
    </div>
  );
}
