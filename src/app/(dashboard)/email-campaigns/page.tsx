import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Campaigns | PhotoProOS",
  description: "Create and send email marketing campaigns to clients.",
};

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { EmailCampaignsClient } from "./email-campaigns-client";

export default async function EmailCampaignsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="email-campaigns-page">
      <PageHeader
        title="Email Campaigns"
        subtitle="Create and send email marketing campaigns"
      />

      <EmailCampaignsClient />
    </div>
  );
}
