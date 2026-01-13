import { redirect } from "next/navigation";
import { getClientPortalData } from "@/lib/actions/client-portal";
import { PortalInvoicesClient } from "./invoices-client";

export const dynamic = "force-dynamic";

export default async function PortalInvoicesPage() {
  const data = await getClientPortalData();

  if (!data) {
    redirect("/portal/login");
  }

  return (
    <PortalInvoicesClient invoices={data.invoices} />
  );
}
