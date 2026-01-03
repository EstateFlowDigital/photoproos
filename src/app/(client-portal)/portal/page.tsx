import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalClient } from "./portal-client";

export const dynamic = "force-dynamic";

export default async function ClientPortalPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalClient
      client={data.client}
      stats={data.stats}
      properties={data.properties}
      galleries={data.galleries}
      invoices={data.invoices}
      questionnaires={data.questionnaires ?? []}
    />
  );
}
