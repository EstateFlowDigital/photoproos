export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function NewProposalPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="New Proposal"
      subtitle="Create a new client proposal"
      icon="✨"
      description="Build proposals from templates with customizable packages and pricing tiers."
      features={[
        "Template-based proposal creation",
        "Package and pricing configuration",
        "Client information auto-fill",
        "Portfolio and gallery inclusion",
        "Terms and contract attachment",
        "Interactive selection options",
      ]}
      relatedLinks={[
        { label: "All Proposals", href: "/proposals" },
        { label: "Templates", href: "/templates/proposals" },
      ]}
    />
  );
}
