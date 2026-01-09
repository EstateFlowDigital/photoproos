import { getInvitationByToken } from "@/lib/actions/invitations";
import { notFound } from "next/navigation";
import { InviteAcceptClient } from "./invite-accept-client";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    notFound();
  }

  return (
    <div data-element="invite-page">
      <InviteAcceptClient invitation={invitation} token={token} />
    </div>
  );
}
