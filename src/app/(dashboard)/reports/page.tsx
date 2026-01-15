import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports | PhotoProOS",
  description: "Access business analytics and performance reports.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="reports-page">
      <PageHeader
        title="Reports"
        subtitle="Business analytics and insights"
      />

      <ReportsClient />
    </div>
  );
}
