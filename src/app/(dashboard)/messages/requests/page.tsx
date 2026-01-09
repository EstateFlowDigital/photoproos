export const dynamic = "force-dynamic";

import { PageHeader, PageContextNav } from "@/components/dashboard";
import { MessageSquare, Bell } from "lucide-react";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { getChatRequests, getPendingChatRequestCount } from "@/lib/actions/chat-requests";
import { getTotalUnreadCount } from "@/lib/actions/conversations";
import { ChatRequestsPageClient } from "./chat-requests-page-client";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ChatRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = params.status as "pending" | "approved" | "rejected" | "expired" | undefined;

  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch chat requests
  const requestsResult = await getChatRequests({
    status: statusFilter,
  });

  const requests = requestsResult.success ? requestsResult.data : [];

  // Get counts for badges
  const [unreadResult, pendingRequestsResult] = await Promise.all([
    getTotalUnreadCount(),
    getPendingChatRequestCount(),
  ]);

  const unreadCount = unreadResult.success ? unreadResult.data : 0;
  const pendingRequestCount = pendingRequestsResult.success ? pendingRequestsResult.data : 0;

  return (
    <div data-element="messages-requests-page" className="space-y-6">
      <PageHeader
        title="Chat Requests"
        subtitle="Review and approve client conversation requests"
      />

      <PageContextNav
        items={[
          {
            label: "Inbox",
            href: "/messages",
            icon: <MessageSquare className="h-4 w-4" />,
            badge: unreadCount > 0 ? unreadCount : undefined,
          },
          {
            label: "Chat Requests",
            href: "/messages/requests",
            icon: <Bell className="h-4 w-4" />,
            badge: pendingRequestCount > 0 ? pendingRequestCount : undefined,
          },
        ]}
      />

      <ChatRequestsPageClient
        requests={requests}
        statusFilter={statusFilter}
      />
    </div>
  );
}
