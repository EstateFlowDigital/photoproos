export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function FailedPaymentsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Failed Payments"
      subtitle="Recover failed payment attempts"
      icon="⚠️"
      description="View failed payments, retry charges, and send payment update reminders."
      features={[
        "Failed payment dashboard and alerts",
        "One-click retry payment attempts",
        "Automated dunning email sequences",
        "Card update request links",
        "Recovery rate tracking",
        "Failure reason analysis",
      ]}
      relatedLinks={[
        { label: "Payments", href: "/payments" },
        { label: "Invoices", href: "/invoices" },
        { label: "Clients", href: "/clients" },
      ]}
    />
  );
}
