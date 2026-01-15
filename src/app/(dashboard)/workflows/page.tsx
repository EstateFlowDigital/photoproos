import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workflows | PhotoProOS",
  description: "Create and manage custom workflows to streamline your photography operations.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { WorkflowsClient } from "./workflows-client";

export default async function WorkflowsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="workflows-page">
      <PageHeader
        title="Workflows"
        subtitle="Create and manage automated workflows"
      />

      <WorkflowsClient />
    </div>
  );
}
