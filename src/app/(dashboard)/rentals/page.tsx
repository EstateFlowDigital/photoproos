export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { RentalsClient } from "./rentals-client";

export default async function RentalsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="rentals-page">
      <PageHeader
        title="Equipment Rentals"
        subtitle="Track gear rentals and equipment loans"
      />

      <RentalsClient />
    </div>
  );
}
