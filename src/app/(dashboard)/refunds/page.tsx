export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { RefundsClient } from "./refunds-client";

export default async function RefundsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="refunds-page">
      <PageHeader
        title="Refunds"
        subtitle="Process and track refunds"
      />

      <RefundsClient />
    </div>
  );
}
