import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Failed Payments | PhotoProOS",
  description: "Review and resolve failed payment attempts.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { FailedPaymentsClient } from "./failed-payments-client";

export default async function FailedPaymentsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="failed-payments-page">
      <PageHeader
        title="Failed Payments"
        subtitle="Recover failed payment attempts"
      />

      <FailedPaymentsClient />
    </div>
  );
}
