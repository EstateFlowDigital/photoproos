export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { FeedbackInboxClient } from "./feedback-inbox-client";

type FilterTab = "all" | "unread" | "resolved";

interface FeedbackPageProps {
  searchParams: Promise<{ filter?: string; type?: string }>;
}

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const params = await searchParams;
  const filter = (params.filter || "all") as FilterTab;
  const typeFilter = params.type || undefined;

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
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
          <p className="mt-2 text-foreground-muted">Please create an organization to get started.</p>
        </div>
      </div>
    );
  }

  // Build filter query
  const where: Prisma.GalleryFeedbackWhereInput = {
    organizationId: organization.id,
  };

  if (filter === "unread") {
    where.isRead = false;
  } else if (filter === "resolved") {
    where.isResolved = true;
  }

  if (typeFilter) {
    where.type = typeFilter;
  }

  // Fetch feedback and stats in parallel
  const [feedbackRecords, stats] = await Promise.all([
    prisma.galleryFeedback.findMany({
      where,
      include: {
        project: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.galleryFeedback.groupBy({
      by: ["type", "isRead", "isResolved"],
      where: { organizationId: organization.id },
      _count: true,
    }),
  ]);

  // Calculate counts
  const counts = {
    all: 0,
    unread: 0,
    resolved: 0,
    byType: {} as Record<string, number>,
  };

  for (const stat of stats) {
    counts.all += stat._count;
    if (!stat.isRead) counts.unread += stat._count;
    if (stat.isResolved) counts.resolved += stat._count;
    counts.byType[stat.type] = (counts.byType[stat.type] || 0) + stat._count;
  }

  // Map feedback to client format
  const feedback = feedbackRecords.map((f) => ({
    id: f.id,
    projectId: f.projectId,
    projectName: f.project.name,
    type: f.type,
    message: f.message,
    clientName: f.clientName,
    clientEmail: f.clientEmail,
    isRead: f.isRead,
    isResolved: f.isResolved,
    createdAt: f.createdAt.toISOString(),
  }));

  return (
    <FeedbackInboxClient
      feedback={feedback}
      counts={counts}
      currentFilter={filter}
      currentType={typeFilter}
    />
  );
}
