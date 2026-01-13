export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ApiKeysClient } from "./api-keys-client";

export default async function ApiKeysPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="api-keys-page">
      <PageHeader
        title="API Keys"
        subtitle="Manage API access and authentication"
      />

      <ApiKeysClient />
    </div>
  );
}
