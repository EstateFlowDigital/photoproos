export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { VendorsClient } from "./vendors-client";

export default async function VendorsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="vendors-page">
      <PageHeader
        title="Vendors"
        subtitle="Manage vendor relationships and referrals"
      />

      <VendorsClient />
    </div>
  );
}
