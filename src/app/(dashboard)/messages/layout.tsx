import { getUserConversations } from "@/lib/actions/conversations";
import { MessagesLayout } from "./messages-layout-client";

export default async function MessagesPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getUserConversations();
  const conversations = result.success && result.data ? result.data : [];

  return (
    <MessagesLayout conversations={conversations}>
      {children}
    </MessagesLayout>
  );
}
