import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proposals | PhotoProOS",
  description: "Create and send professional proposals to potential clients.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ProposalsClient } from "./proposals-client";

export default async function ProposalsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="proposals-page">
      <PageHeader
        title="Proposals"
        subtitle="Create and track client proposals"
      />

      <ProposalsClient />
    </div>
  );
}
