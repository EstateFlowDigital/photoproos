import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalFilesClient } from "./files-client";

export const dynamic = "force-dynamic";

export default async function PortalFilesPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalFilesClient
      clientName={data.client.fullName}
      clientEmail={data.client.email}
    />
  );
}
