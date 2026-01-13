export const dynamic = "force-dynamic";

import { MessageSquare, Edit } from "lucide-react";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { getUserConversations } from "@/lib/actions/conversations";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";

export default async function MessagesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const [result, walkthroughPreferenceResult] = await Promise.all([
    getUserConversations(),
    getWalkthroughPreference("messages"),
  ]);
  const conversations = result.success && result.data ? result.data : [];
  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  // Empty state - shown in main content area when no conversation is selected
  // On mobile, users see the sidebar. On desktop, they see this.
  return (
    <div data-element="messages-page" className="flex flex-1 flex-col p-8">
      <WalkthroughWrapper pageId="messages" initialState={walkthroughState} />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)]">
        <MessageSquare className="h-12 w-12 text-white" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-[var(--foreground)]">
        Messages
      </h2>
      <p className="mt-3 max-w-md text-[var(--foreground-muted)]">
        {conversations.length > 0
          ? "Select a conversation from the sidebar to view messages, or start a new conversation."
          : "Start a new message to connect with your team members or clients."}
      </p>
      <Link
        href="/messages/new?type=direct"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors shadow-lg shadow-[var(--primary)]/25"
      >
        <Edit className="h-4 w-4" />
        New Message
      </Link>

      {/* Quick Stats */}
      {conversations.length > 0 && (
        <div className="mt-12 flex items-center gap-8 text-sm text-[var(--foreground-muted)]">
          <div className="text-center">
            <div className="text-2xl font-semibold text-[var(--foreground)]">{conversations.length}</div>
            <div>Conversations</div>
          </div>
          <div className="h-8 w-px bg-[var(--card-border)]" />
          <div className="text-center">
            <div className="text-2xl font-semibold text-[var(--foreground)]">
              {conversations.filter(c => c.unreadCount && c.unreadCount > 0).length}
            </div>
            <div>Unread</div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
