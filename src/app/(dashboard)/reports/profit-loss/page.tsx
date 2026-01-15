import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profit & Loss | PhotoProOS",
  description: "View profit and loss statements.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ProfitLossClient } from "./profit-loss-client";

export default async function ProfitLossPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="reports-profit-loss-page" className="space-y-6">
      <PageHeader
        title="Profit & Loss"
        subtitle="View your business income and expenses"
        backHref="/reports"
      />

      <ProfitLossClient />
    </div>
  );
}
