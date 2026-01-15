import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expenses | PhotoProOS",
  description: "Track business expenses and manage photography costs.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ExpensesClient } from "./expenses-client";

export default async function ExpensesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="expenses-page">
      <PageHeader
        title="Expenses"
        subtitle="Track and manage business expenses"
      />

      <ExpensesClient />
    </div>
  );
}
