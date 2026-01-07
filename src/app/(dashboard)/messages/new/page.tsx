export const dynamic = "force-dynamic";

import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { getTeamMembers } from "@/lib/actions/settings";
import { NewConversationPageClient } from "./new-conversation-page-client";

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function NewConversationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = (params.type as "direct" | "group" | "channel") || "direct";

  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch team members
  const members = await getTeamMembers();

  // Filter out current user and transform to simpler format
  const teamMembers = members
    .filter((m) => m.userId !== auth.userId)
    .map((m) => ({
      id: m.userId,
      fullName: m.user.fullName,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
    }));

  return (
    <NewConversationPageClient
      type={type}
      teamMembers={teamMembers}
      currentUserId={auth.userId}
    />
  );
}
