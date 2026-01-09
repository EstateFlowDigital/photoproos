export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { AvailabilityPageClient } from "./availability-page-client";

export default async function AvailabilityPage() {
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

  // Fetch availability blocks and booking buffers
  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  const [availabilityBlocks, bookingBuffer, calendarIntegrations] = await Promise.all([
    prisma.availabilityBlock.findMany({
      where: {
        organizationId: organization.id,
        OR: [
          // Non-recurring blocks in the next 3 months
          {
            isRecurring: false,
            startDate: { lte: threeMonthsFromNow },
            endDate: { gte: now },
          },
          // Recurring blocks (we'll expand them on the client)
          { isRecurring: true },
        ],
      },
      orderBy: { startDate: "asc" },
    }),
    prisma.bookingBuffer.findFirst({
      where: {
        organizationId: organization.id,
        serviceId: null, // Org-wide default
      },
    }),
    prisma.calendarIntegration.findMany({
      where: {
        organizationId: organization.id,
        syncEnabled: true,
      },
      select: {
        id: true,
        provider: true,
        name: true,
        color: true,
        lastSyncAt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6" data-element="scheduling-availability-page">
      <AvailabilityPageClient
        availabilityBlocks={availabilityBlocks}
        defaultBuffer={bookingBuffer}
        calendarIntegrations={calendarIntegrations}
      />
    </div>
  );
}
