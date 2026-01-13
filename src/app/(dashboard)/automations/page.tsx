export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { AutomationsClient } from "./automations-client";

export default async function AutomationsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="automations-page">
      <PageHeader
        title="Automations"
        subtitle="Automated actions and triggers"
      />

      <AutomationsClient />
    </div>
  );
}
