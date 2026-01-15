import { Metadata } from "next";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ApiKeysClient } from "./api-keys-client";

export const metadata: Metadata = {
  title: "API Keys | PhotoProOS",
  description: "Manage API keys for third-party integrations.",
};

export const dynamic = "force-dynamic";

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
