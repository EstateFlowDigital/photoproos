export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function StudioPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="studio-page">
      <ComingSoonPage
        title="Studio"
        subtitle="Manage studio space and bookings"
        icon="🏢"
        description="Book studio time, manage space availability, and track utilization."
        features={[
          "Studio space booking calendar",
          "Multiple room/space management",
          "Client self-booking options",
          "Rental pricing and packages",
          "Utilization reports and analytics",
          "Equipment and prop add-ons",
        ]}
        relatedLinks={[
          { label: "Calendar", href: "/calendar" },
          { label: "Gear", href: "/gear" },
          { label: "Rentals", href: "/rentals" },
        ]}
      />
    </div>
  );
}
