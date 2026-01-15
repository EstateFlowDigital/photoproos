import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Recaps | PhotoProOS",
  description: "Create session recap summaries for clients.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { SessionRecapsClient } from "./session-recaps-client";
import { prisma } from "@/lib/db";

async function getCompletedSessions(organizationId: string) {
  // Get recent completed bookings
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const bookings = await prisma.booking.findMany({
    where: {
      organizationId,
      status: "completed",
      startTime: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      client: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: { startTime: "desc" },
    take: 20,
  });

  return bookings.map((b) => ({
    id: b.id,
    clientName: b.client?.fullName || b.clientName || "Unknown Client",
    clientEmail: b.client?.email || b.clientEmail || "",
    date: b.startTime.toISOString(),
    type: b.title || "Photo Session",
    photoCount: Math.floor(Math.random() * 200) + 50, // Placeholder - would come from gallery
    hasRecap: Math.random() > 0.5, // Placeholder - would track actual recap status
  }));
}

export default async function SessionRecapsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const sessions = await getCompletedSessions(auth.organizationId);

  return (
    <div data-element="session-recaps-page" className="space-y-6">
      <PageHeader
        title="Session Recaps"
        subtitle="Post-session summaries for clients"
      />

      <SessionRecapsClient sessions={sessions} />
    </div>
  );
}
