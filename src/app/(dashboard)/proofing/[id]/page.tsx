export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProofingSessionPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Proofing Session"
      subtitle="Review client selections"
      icon="🖼️"
      description="View client selections, comments, and finalize deliverables."
      features={[
        "Client selection review",
        "Comments and feedback viewing",
        "Favorite and reject tracking",
        "Finalize and approve selections",
        "Generate order from selections",
        "Export selection list",
      ]}
      relatedLinks={[
        { label: "All Proofing", href: "/proofing" },
        { label: "Galleries", href: "/galleries" },
      ]}
    />
  );
}
