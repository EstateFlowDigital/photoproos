export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ToursClient } from "./tours-client";

export default async function ToursPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="tours-page">
      <PageHeader
        title="Virtual Tours"
        subtitle="Create and manage 3D virtual tours"
      />

      <ToursClient />
    </div>
  );
}
