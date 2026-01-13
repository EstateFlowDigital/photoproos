import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalFavoritesClient } from "./favorites-client";

export const dynamic = "force-dynamic";

export default async function PortalFavoritesPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalFavoritesClient
      galleries={data.galleries}
      clientId={data.client.id}
    />
  );
}
