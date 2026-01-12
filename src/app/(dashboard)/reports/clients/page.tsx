export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ClientsReportPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="reports-clients-page">
      <ComingSoonPage
        title="Client Analytics"
        subtitle="Client acquisition and retention metrics"
        icon="👥"
        description="Client lifetime value, repeat booking rates, and referral tracking."
        features={[
          "Client lifetime value tracking",
          "Repeat booking rates and patterns",
          "Referral source tracking",
          "Client acquisition costs",
          "Client retention analysis",
          "Geographic distribution insights",
        ]}
        relatedLinks={[
          { label: "All Reports", href: "/reports" },
          { label: "Clients", href: "/clients" },
          { label: "Referrals", href: "/referrals" },
        ]}
      />
    </div>
  );
}
