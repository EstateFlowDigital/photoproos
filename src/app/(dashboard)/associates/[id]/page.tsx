export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssociateDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Associate Profile"
      subtitle="View associate details"
      icon="👤"
      description="View associate profile, job history, ratings, and payment records."
      features={[
        "Profile and portfolio viewing",
        "Job history and assignments",
        "Ratings and client feedback",
        "Payment records and earnings",
        "Availability calendar",
        "Contract and rate management",
      ]}
      relatedLinks={[
        { label: "All Associates", href: "/associates" },
        { label: "Team", href: "/team" },
      ]}
    />
  );
}
