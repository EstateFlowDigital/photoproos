export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function MileagePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="mileage-page">
      <ComingSoonPage
        title="Mileage Tracking"
        subtitle="Log and track business mileage for tax deductions"
        icon="🚗"
        description="Track mileage for client visits, auto-calculate IRS rates, and export for tax filing."
        features={[
          "GPS-based automatic trip tracking",
          "IRS standard mileage rate calculations (updated annually)",
          "Link trips to specific clients and projects",
          "Business vs. personal trip categorization",
          "Monthly and annual mileage summaries",
          "Export mileage logs for tax deductions",
        ]}
        relatedLinks={[
          { label: "Track Expenses", href: "/expenses" },
          { label: "Tax Summary", href: "/reports/tax-summary" },
          { label: "View Schedule", href: "/scheduling" },
        ]}
      />
    </div>
  );
}
