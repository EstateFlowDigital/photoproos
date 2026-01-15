import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { CollectionsClient } from "./collections-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections | PhotoProOS",
  description: "Organize photos into curated collections for clients.",
};

export const dynamic = "force-dynamic";

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
