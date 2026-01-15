import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payroll | PhotoProOS",
  description: "Manage team payroll and compensation.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { PayrollClient } from "./payroll-client";

export default async function PayrollPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="payroll-page">
      <PageHeader
        title="Payroll"
        subtitle="Process contractor and employee payments"
      />

      <PayrollClient />
    </div>
  );
}
