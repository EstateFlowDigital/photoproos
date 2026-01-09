import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";
import { TaxPrepClient } from "./tax-prep-client";
import { getOrCreateTaxPrepSession, getTaxYearExpenseSummary, getTaxYearRevenueSummary, getTaxDocuments } from "@/lib/actions/tax-prep";

export const metadata = {
  title: "Tax Preparation | Settings",
  description: "Prepare your business expenses and documents for tax season",
};

export const dynamic = "force-dynamic";

export default async function TaxPrepPage() {
  // Default to previous year for tax prep
  const currentYear = new Date().getFullYear();
  const taxYear = currentYear - 1;

  // Fetch initial data
  const [sessionResult, expenseResult, revenueResult] = await Promise.all([
    getOrCreateTaxPrepSession(taxYear),
    getTaxYearExpenseSummary(taxYear),
    getTaxYearRevenueSummary(taxYear),
  ]);

  const session = sessionResult.success ? sessionResult.data : null;
  const documents = session
    ? (await getTaxDocuments(session.id)).success
      ? (await getTaxDocuments(session.id)).data
      : []
    : [];

  return (
    <div data-element="settings-tax-prep-page" className="space-y-6">
      <PageHeader
        title="Tax Preparation"
        subtitle={`Prepare your ${taxYear} business expenses and documents for tax season`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      <TaxPrepClient
        taxYear={taxYear}
        initialSession={session}
        initialExpenses={expenseResult.success ? expenseResult.data : null}
        initialRevenue={revenueResult.success ? revenueResult.data : null}
        initialDocuments={documents || []}
      />
    </div>
  );
}
