export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { MembershipsClient } from "./memberships-client";

export default async function MembershipsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="memberships-page">
      <PageHeader
        title="Memberships"
        subtitle="Client membership programs"
      />

      <MembershipsClient />
    </div>
  );
}
