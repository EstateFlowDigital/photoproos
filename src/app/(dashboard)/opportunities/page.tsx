import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opportunities | PhotoProOS",
  description: "Manage sales opportunities and potential photography projects.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function OpportunitiesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Opportunities"
      subtitle="Track potential deals and leads"
      icon="🎯"
      description="Manage sales opportunities with deal values, probability scores, and follow-up reminders."
      features={[
        "Deal value and expected close date tracking",
        "Win probability scoring and forecasting",
        "Activity timeline (calls, emails, meetings)",
        "Automated follow-up reminders and tasks",
        "Convert opportunities to bookings with one click",
        "Lost reason tracking for insights",
      ]}
      relatedLinks={[
        { label: "Sales Pipeline", href: "/pipeline" },
        { label: "Leads", href: "/leads" },
        { label: "Create Proposal", href: "/proposals" },
      ]}
    />
  );
}
