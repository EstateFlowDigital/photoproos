export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MembershipDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Membership Details"
      subtitle="Manage membership plan"
      icon="👑"
      description="View members, billing history, and manage membership benefits."
      features={[
        "Member list and management",
        "Billing and payment history",
        "Benefits and perks settings",
        "Pricing tier configuration",
        "Renewal and cancellation handling",
        "Member communication tools",
      ]}
      relatedLinks={[
        { label: "All Memberships", href: "/memberships" },
        { label: "Clients", href: "/clients" },
      ]}
    />
  );
}
