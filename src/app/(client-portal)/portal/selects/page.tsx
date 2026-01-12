import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalSelectsClient } from "./selects-client";

export const dynamic = "force-dynamic";

export default async function PortalSelectsPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalSelectsClient
      clientName={data.client.fullName}
      clientEmail={data.client.email}
    />
  );
}
