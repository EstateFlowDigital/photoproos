export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { RevenueReportClient } from "./revenue-report-client";

export default async function RevenueReportPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="reports-revenue-page">
      <PageHeader
        title="Revenue Report"
        subtitle="Track income and revenue trends"
      />

      <RevenueReportClient />
    </div>
  );
}
