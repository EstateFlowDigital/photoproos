export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function RefundsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Refunds"
      subtitle="Process and track refunds"
      icon="💸"
      description="Process refunds, track refund history, and manage refund policies."
      features={[
        "Full and partial refund processing",
        "Refund reason tracking",
        "Automatic Stripe/Square integration",
        "Refund policy templates",
        "Client notification emails",
        "Refund reports and analytics",
      ]}
      relatedLinks={[
        { label: "Payments", href: "/payments" },
        { label: "Invoices", href: "/invoices" },
        { label: "Reports", href: "/reports" },
      ]}
    />
  );
}
