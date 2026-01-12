import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalContractsClient } from "./contracts-client";

export const dynamic = "force-dynamic";

export default async function PortalContractsPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalContractsClient
      clientName={data.client.fullName}
      clientEmail={data.client.email}
    />
  );
}
