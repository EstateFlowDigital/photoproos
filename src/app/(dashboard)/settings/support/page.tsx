import { Suspense } from "react";
import { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { getSupportTickets } from "@/lib/actions/support-tickets";
import { SupportPageClient } from "./support-client";

export const metadata: Metadata = {
  title: "Support | Settings",
  description: "View and manage your support tickets",
};

async function SupportTicketLoader() {
  const result = await getSupportTickets();
  const tickets = result.success ? result.data : [];

  // Transform to match the expected ticket format
  const transformedTickets = tickets.map((ticket) => ({
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
    messages: [], // We'll load messages when opening a specific ticket
  }));

  return <SupportPageClient initialTickets={transformedTickets} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 rounded-lg bg-[var(--background-tertiary)] animate-pulse"
        />
      ))}
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Support"
        description="View your support tickets and get help"
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <SupportTicketLoader />
      </Suspense>
    </div>
  );
}
