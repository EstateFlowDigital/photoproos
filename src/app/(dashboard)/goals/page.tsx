export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function GoalsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="goals-page">
      <ComingSoonPage
        title="Goals"
        subtitle="Set and track business goals"
        icon="🎯"
        description="Set revenue, booking, and growth goals. Track progress with visual dashboards."
        features={[
          "Monthly and annual revenue goals",
          "Booking count targets by service type",
          "Visual progress bars and charts",
          "Milestone celebrations and notifications",
          "Compare performance to previous periods",
          "Team goals and individual targets",
        ]}
        relatedLinks={[
          { label: "Analytics", href: "/analytics" },
          { label: "Revenue Report", href: "/reports/revenue" },
          { label: "Dashboard", href: "/dashboard" },
        ]}
      />
    </div>
  );
}
