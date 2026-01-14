export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ProposalTemplatesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Proposal Templates"
      subtitle="Create reusable proposal templates"
      icon="📄"
      description="Design proposal templates with pricing packages and customizable sections."
      features={[
        "Drag-and-drop proposal builder",
        "Package and pricing sections",
        "Portfolio and gallery integration",
        "Client selection and approval workflow",
        "Brand customization and styling",
        "Interactive pricing options",
      ]}
      relatedLinks={[
        { label: "All Templates", href: "/templates" },
        { label: "Proposals", href: "/proposals" },
        { label: "Services", href: "/services" },
      ]}
    />
  );
}
