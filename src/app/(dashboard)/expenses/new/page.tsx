export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function NewExpensePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="New Expense"
      subtitle="Record a new business expense"
      icon="➕"
      description="Add new expenses with receipt uploads, vendor tracking, and category assignment."
      features={[
        "Receipt upload and OCR scanning",
        "Vendor and category selection",
        "Project and client assignment",
        "Tax category tracking",
        "Recurring expense setup",
        "Mileage and travel logging",
      ]}
      relatedLinks={[
        { label: "All Expenses", href: "/expenses" },
        { label: "Mileage", href: "/mileage" },
      ]}
    />
  );
}
