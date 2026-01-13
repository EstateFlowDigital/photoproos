import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalGalleriesClient } from "./galleries-client";

export const dynamic = "force-dynamic";

export default async function PortalGalleriesPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalGalleriesClient
      galleries={data.galleries}
      clientId={data.client.id}
    />
  );
}
