export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function RevenueReportPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="reports-revenue-page">
      <ComingSoonPage
        title="Revenue Report"
        subtitle="Track income and revenue trends"
        icon="💰"
        description="Revenue by service type, client, time period, and growth trends."
        features={[
          "Revenue breakdown by service type and package",
          "Top clients by revenue and booking frequency",
          "Monthly, quarterly, and yearly trend analysis",
          "Average order value and booking value metrics",
          "Revenue forecasting based on booked sessions",
          "Comparison with previous periods",
        ]}
        relatedLinks={[
          { label: "All Reports", href: "/reports" },
          { label: "Profit & Loss", href: "/reports/profit-loss" },
          { label: "Analytics", href: "/analytics" },
          { label: "Invoices", href: "/invoices" },
        ]}
      />
    </div>
  );
}
