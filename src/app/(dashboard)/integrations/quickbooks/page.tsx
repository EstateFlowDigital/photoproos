export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function QuickBooksIntegrationPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="QuickBooks Integration"
      subtitle="Sync invoices and expenses with QuickBooks"
      icon="📒"
      description="Auto-sync invoices, expenses, and payments with QuickBooks Online."
      features={[
        "Two-way invoice synchronization",
        "Expense tracking integration",
        "Payment status sync",
        "Customer record matching",
        "Account mapping configuration",
        "Sync history and error logs",
      ]}
      relatedLinks={[
        { label: "All Integrations", href: "/integrations" },
        { label: "Invoices", href: "/invoices" },
        { label: "Expenses", href: "/expenses" },
      ]}
    />
  );
}
