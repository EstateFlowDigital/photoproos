import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goals | PhotoProOS",
  description: "Set and track your photography business goals.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { GoalsClient } from "./goals-client";

export default async function GoalsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="goals-page">
      <PageHeader
        title="Goals"
        subtitle="Set and track business goals"
      />

      <GoalsClient />
    </div>
  );
}
