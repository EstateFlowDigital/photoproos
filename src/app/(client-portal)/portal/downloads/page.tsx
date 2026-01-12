import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalDownloadsClient } from "./downloads-client";

export const dynamic = "force-dynamic";

export default async function PortalDownloadsPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalDownloadsClient
      clientName={data.client.fullName}
      clientEmail={data.client.email}
    />
  );
}
