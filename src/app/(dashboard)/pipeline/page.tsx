import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Pipeline | PhotoProOS",
  description: "Track opportunities through your sales pipeline.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { PipelineClient } from "./pipeline-client";

export default async function PipelinePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="pipeline-page">
      <PageHeader
        title="Sales Pipeline"
        subtitle="Visualize and manage your sales funnel"
      />

      <PipelineClient />
    </div>
  );
}
