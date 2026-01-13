export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { TemplatesClient } from "./templates-client";

export default async function TemplatesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="templates-page">
      <PageHeader
        title="Templates"
        subtitle="Manage all your business templates"
      />

      <TemplatesClient />
    </div>
  );
}
