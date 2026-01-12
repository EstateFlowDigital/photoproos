import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalProofingClient } from "./proofing-client";

export const dynamic = "force-dynamic";

export default async function PortalProofingPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalProofingClient
      clientName={data.client.fullName}
      clientEmail={data.client.email}
    />
  );
}
