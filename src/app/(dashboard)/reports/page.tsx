export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="reports-page">
      <ComingSoonPage
        title="Reports"
        subtitle="Business analytics and insights"
        icon="📊"
        description="Comprehensive business reports including revenue, clients, bookings, and team performance."
        features={[
          "Revenue reports - income by service, client, and period",
          "Client reports - acquisition, retention, lifetime value",
          "Booking reports - session types, peak times, utilization",
          "Team reports - productivity, assignments, payroll",
          "Profit & loss statements",
          "Tax summaries and deduction tracking",
        ]}
        relatedLinks={[
          { label: "Revenue", href: "/reports/revenue" },
          { label: "Clients", href: "/reports/clients" },
          { label: "Bookings", href: "/reports/bookings" },
          { label: "Profit & Loss", href: "/reports/profit-loss" },
        ]}
      />
    </div>
  );
}
