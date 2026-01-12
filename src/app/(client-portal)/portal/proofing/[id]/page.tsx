import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalProofingSessionClient } from "./proofing-session-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalProofingSessionPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalProofingSessionClient
      sessionId={id}
      clientName={data.client.fullName}
      clientEmail={data.client.email}
    />
  );
}
