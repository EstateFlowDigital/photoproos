export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { PrintsClient } from "./prints-client";

export default async function PrintsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="prints-page">
      <PageHeader
        title="Print Orders"
        subtitle="Manage print orders and fulfillment"
      />

      <PrintsClient />
    </div>
  );
}
