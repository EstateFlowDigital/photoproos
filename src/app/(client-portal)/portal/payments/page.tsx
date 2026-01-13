import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalPaymentsClient } from "./payments-client";

export const dynamic = "force-dynamic";

export default async function PortalPaymentsPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalPaymentsClient invoices={data.invoices} />
  );
}
