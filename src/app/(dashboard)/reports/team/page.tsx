import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Reports | PhotoProOS",
  description: "Analyze team performance and productivity.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { TeamReportClient } from "./team-report-client";

export default async function TeamReportPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="reports-team-page" className="space-y-6">
      <PageHeader
        title="Team Performance"
        subtitle="Track team productivity and workload"
        backHref="/reports"
      />

      <TeamReportClient />
    </div>
  );
}
