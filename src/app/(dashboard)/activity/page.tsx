export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ActivityClient } from "./activity-client";

export default async function ActivityPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="activity-page">
      <PageHeader
        title="Activity Feed"
        subtitle="Recent activity across your account"
      />

      <ActivityClient />
    </div>
  );
}
