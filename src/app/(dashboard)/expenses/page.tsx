export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ExpensesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="expenses-page">
      <ComingSoonPage
        title="Expenses"
        subtitle="Track and manage business expenses"
        icon="💰"
        description="Track business expenses, categorize spending, and generate expense reports for tax preparation."
        features={[
          "Receipt scanning with automatic data extraction",
          "Expense categorization (equipment, travel, software, etc.)",
          "Recurring expense tracking for subscriptions",
          "Project-based expense allocation",
          "Tax-deductible expense tagging",
          "Export reports for accountants (CSV, PDF)",
        ]}
        relatedLinks={[
          { label: "Track Mileage", href: "/mileage" },
          { label: "Profit & Loss", href: "/reports/profit-loss" },
          { label: "Tax Summary", href: "/reports/tax-summary" },
        ]}
      />
    </div>
  );
}
