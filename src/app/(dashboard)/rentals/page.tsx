export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function RentalsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="rentals-page">
      <ComingSoonPage
        title="Equipment Rentals"
        subtitle="Track gear rentals and equipment loans"
        icon="📷"
        description="Manage equipment inventory, track rentals, and schedule gear maintenance."
        features={[
          "Equipment inventory tracking",
          "Rental booking and scheduling",
          "Check-out and check-in logging",
          "Rental pricing and packages",
          "Equipment condition tracking",
          "Maintenance scheduling",
        ]}
        relatedLinks={[
          { label: "Gear", href: "/gear" },
          { label: "Studio", href: "/studio" },
          { label: "Calendar", href: "/calendar" },
        ]}
      />
    </div>
  );
}
