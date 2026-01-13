export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { CollectionsClient } from "./collections-client";

export default async function CollectionsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="collections-page">
      <PageHeader
        title="Collections"
        subtitle="Curated photo collections"
      />

      <CollectionsClient />
    </div>
  );
}
