export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProposalDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Proposal Details"
      subtitle="View and manage proposal"
      icon="📄"
      description="View proposal status, client feedback, and conversion tracking."
      features={[
        "Proposal content editing",
        "Client view tracking and analytics",
        "Version history and comparisons",
        "Electronic signature collection",
        "Convert to invoice or contract",
        "Follow-up reminders and automation",
      ]}
      relatedLinks={[
        { label: "All Proposals", href: "/proposals" },
        { label: "Templates", href: "/templates/proposals" },
        { label: "Opportunities", href: "/opportunities" },
      ]}
    />
  );
}
