export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { TaxSummaryClient } from "./tax-summary-client";

export default async function TaxSummaryPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="reports-tax-summary-page" className="space-y-6">
      <PageHeader
        title="Tax Summary"
        subtitle="Tax-ready reports and deductions overview"
        backHref="/reports"
      />

      <TaxSummaryClient />
    </div>
  );
}
