export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Opportunity Details"
      subtitle="Manage deal progression"
      icon="💼"
      description="View opportunity details, track communications, and manage deal progression."
      features={[
        "Deal value and probability tracking",
        "Pipeline stage management",
        "Activity timeline and notes",
        "Communication history",
        "Convert to booking or project",
        "Task and follow-up management",
      ]}
      relatedLinks={[
        { label: "All Opportunities", href: "/opportunities" },
        { label: "Leads", href: "/leads" },
        { label: "Proposals", href: "/proposals" },
      ]}
    />
  );
}
