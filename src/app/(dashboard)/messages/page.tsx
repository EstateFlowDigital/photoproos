export const dynamic = "force-dynamic";

import { PageHeader, PageContextNav } from "@/components/dashboard";
import { MessageSquare, Users, Bell } from "lucide-react";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { getUserConversations, getTotalUnreadCount } from "@/lib/actions/conversations";
import { getPendingChatRequestCount } from "@/lib/actions/chat-requests";
import { MessagesPageClient } from "./messages-page-client";

interface PageProps {
  searchParams: Promise<{ type?: string; search?: string }>;
}

export default async function MessagesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const typeFilter = params.type as "direct" | "group" | "channel" | "client_support" | undefined;

  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch conversations
  const conversationsResult = await getUserConversations({
    type: typeFilter,
    search: params.search,
  });

  const conversations = conversationsResult.success ? conversationsResult.data : [];

  // Get counts for badges
  const [unreadResult, pendingRequestsResult] = await Promise.all([
    getTotalUnreadCount(),
    getPendingChatRequestCount(),
  ]);

  const unreadCount = unreadResult.success ? unreadResult.data : 0;
  const pendingRequestCount = pendingRequestsResult.success ? pendingRequestsResult.data : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        subtitle="Team conversations and client support"
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

      <MessagesPageClient
        conversations={conversations}
        typeFilter={typeFilter}
      />
    </div>
  );
}
