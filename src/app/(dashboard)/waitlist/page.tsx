export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { WaitlistClient } from "./waitlist-client";

export default async function WaitlistPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="waitlist-page">
      <PageHeader
        title="Waitlist"
        subtitle="Manage priority booking waitlist"
      />

      <WaitlistClient />
    </div>
  );
}
