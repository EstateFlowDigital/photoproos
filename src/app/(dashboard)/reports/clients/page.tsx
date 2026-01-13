export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ClientsReportClient } from "./clients-report-client";

export default async function ClientsReportPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="reports-clients-page">
      <PageHeader
        title="Client Analytics"
        subtitle="Client acquisition and retention metrics"
      />

      <ClientsReportClient />
    </div>
  );
}
