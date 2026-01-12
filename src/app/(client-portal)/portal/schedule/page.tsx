import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalScheduleClient } from "./schedule-client";

export const dynamic = "force-dynamic";

export default async function PortalSchedulePage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalScheduleClient
      clientName={data.client.fullName}
      clientEmail={data.client.email}
    />
  );
}
