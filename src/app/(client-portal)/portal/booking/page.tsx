import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalBookingClient } from "./booking-client";

export const dynamic = "force-dynamic";

export default async function PortalBookingPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalBookingClient
      clientName={data.client.fullName}
      clientEmail={data.client.email}
    />
  );
}
