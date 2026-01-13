export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { AvailabilityClient } from "./availability-client";

export default async function AvailabilityPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="availability-page">
      <PageHeader
        title="Availability"
        subtitle="Set your booking availability"
      />

      <AvailabilityClient />
    </div>
  );
}
