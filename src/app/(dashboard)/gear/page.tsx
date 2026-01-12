export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function GearPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="gear-page">
      <ComingSoonPage
        title="Gear"
        subtitle="Equipment inventory and tracking"
        icon="📷"
        description="Track cameras, lenses, lighting, and accessories with serial numbers and insurance values."
        features={[
          "Complete equipment inventory with photos",
          "Serial numbers and purchase dates",
          "Insurance values and depreciation tracking",
          "Maintenance schedules and service history",
          "Gear kit presets for different shoot types",
          "Equipment checkout for team members",
        ]}
        relatedLinks={[
          { label: "Maintenance", href: "/gear/maintenance" },
          { label: "Rentals", href: "/rentals" },
          { label: "Expenses", href: "/expenses" },
        ]}
      />
    </div>
  );
}
