export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { AlbumsClient } from "./albums-client";

export default async function AlbumsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="albums-page">
      <PageHeader
        title="Albums"
        subtitle="Create and manage photo albums"
      />

      <AlbumsClient />
    </div>
  );
}
