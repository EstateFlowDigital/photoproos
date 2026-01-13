export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { CouponsClient } from "./coupons-client";

export default async function CouponsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="coupons-page">
      <PageHeader
        title="Coupons & Promo Codes"
        subtitle="Create and manage discount codes"
      />

      <CouponsClient />
    </div>
  );
}
