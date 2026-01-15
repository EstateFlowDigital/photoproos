import { Metadata } from "next";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { WaitlistClient } from "./waitlist-client";

export const metadata: Metadata = {
  title: "Waitlist | PhotoProOS",
  description: "Manage client waitlists for popular services.",
};

export const dynamic = "force-dynamic";

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
