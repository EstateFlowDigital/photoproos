export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function AssociatesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Associates"
      subtitle="Second shooters and associate photographers"
      icon="📸"
      description="Manage second shooters, track availability, and handle associate payments."
      features={[
        "Associate photographer profiles and portfolios",
        "Availability calendar integration",
        "Rate management and pay tracking",
        "Assignment to projects and sessions",
        "Performance ratings and notes",
        "Contract and W-9 document storage",
      ]}
      relatedLinks={[
        { label: "Team", href: "/team" },
        { label: "Timesheets", href: "/timesheets" },
        { label: "Payroll", href: "/payroll" },
      ]}
    />
  );
}
