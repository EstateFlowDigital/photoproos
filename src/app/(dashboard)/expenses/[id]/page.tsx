export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExpenseDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Expense Details"
      subtitle="View and edit expense"
      icon="🧾"
      description="View and edit expense details, attach receipts, and categorize for reporting."
      features={[
        "Expense amount and date editing",
        "Receipt image upload and OCR",
        "Category and tax classification",
        "Project and client assignment",
        "Reimbursement status tracking",
        "Mileage and travel expense logging",
      ]}
      relatedLinks={[
        { label: "All Expenses", href: "/expenses" },
        { label: "Mileage", href: "/mileage" },
        { label: "Financial Reports", href: "/reports/financial" },
      ]}
    />
  );
}
