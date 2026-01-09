export const dynamic = "force-dynamic";

import { getAuthContext } from "@/lib/auth/clerk";
import { redirect, notFound } from "next/navigation";
import { getConversationById } from "@/lib/actions/conversations";
import { getConversationMessages } from "@/lib/actions/messages";
import { ConversationPageClient } from "./conversation-page-client";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;

  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch conversation
  const conversationResult = await getConversationById(conversationId);
  if (!conversationResult.success) {
    notFound();
  }

  // Fetch initial messages
  const messagesResult = await getConversationMessages(conversationId, {
    limit: 50,
    parentId: null, // Only top-level messages
  });

  const messages = messagesResult.success ? messagesResult.data.messages : [];

  return (
    <div data-element="messages-conversation-page">
      <ConversationPageClient
        conversation={conversationResult.data}
        initialMessages={messages}
        currentUserId={auth.userId}
      />
    </div>
  );
}
