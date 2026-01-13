import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/actions/client-auth";
import { getClientContracts } from "@/lib/actions/client-portal";
import { PortalContractsClient } from "./contracts-client";

export const dynamic = "force-dynamic";

export default async function PortalContractsPage() {
  const session = await getClientSession();

  if (!session) {
    redirect("/portal/login");
  }

  const contracts = await getClientContracts();

  return <PortalContractsClient contracts={contracts ?? []} />;
}
