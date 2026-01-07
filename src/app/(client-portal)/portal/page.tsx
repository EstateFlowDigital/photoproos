import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import PortalLoading from "./loading";

export const dynamic = "force-dynamic";

const PortalClient = nextDynamic(
  () => import("./portal-client").then((m) => m.PortalClient),
  { ssr: false, loading: () => <PortalLoading /> }
);

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
      leads={data.leads}
      questionnaires={data.questionnaires ?? []}
    />
  );
}
