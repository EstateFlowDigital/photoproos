import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminSupportTicket } from "@/lib/actions/support-tickets";
import { TicketDetailClient } from "./ticket-detail-client";

interface PageProps {
  params: Promise<{ ticketId: string }>;
}

async function TicketLoader({ ticketId }: { ticketId: string }) {
  const result = await getAdminSupportTicket(ticketId);

  if (!result.success || !result.data) {
    notFound();
  }

  return <TicketDetailClient ticket={result.data} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-[var(--background-tertiary)] animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-64 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Chat skeleton */}
      <div className="h-96 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />

      {/* Input skeleton */}
      <div className="h-24 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
    </div>
  );
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { ticketId } = await params;

  return (
    <div data-element="super-admin-ticket-detail-page">
      <Suspense fallback={<LoadingSkeleton />}>
        <TicketLoader ticketId={ticketId} />
      </Suspense>
    </div>
  );
}
