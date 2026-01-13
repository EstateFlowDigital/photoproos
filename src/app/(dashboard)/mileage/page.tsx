export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { MileageClient } from "./mileage-client";

export default async function MileagePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="mileage-page">
      <PageHeader
        title="Mileage Tracking"
        subtitle="Log trips and track tax deductions"
      />

      <MileageClient />
    </div>
  );
}
