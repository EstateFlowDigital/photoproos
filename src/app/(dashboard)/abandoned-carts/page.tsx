export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { AbandonedCartsClient } from "./abandoned-carts-client";

export default async function AbandonedCartsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="abandoned-carts-page">
      <PageHeader
        title="Abandoned Carts"
        subtitle="Recover lost sales"
      />

      <AbandonedCartsClient />
    </div>
  );
}
