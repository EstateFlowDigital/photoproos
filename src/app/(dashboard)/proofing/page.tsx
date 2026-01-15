import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proofing | PhotoProOS",
  description: "Manage client photo proofing and selections.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ProofingClient } from "./proofing-client";

export default async function ProofingPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="proofing-page">
      <PageHeader
        title="Proofing Sessions"
        subtitle="Client photo selection and proofing"
      />

      <ProofingClient />
    </div>
  );
}
