import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gear Maintenance | PhotoProOS",
  description: "Track equipment maintenance schedules.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function GearMaintenancePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Gear Maintenance"
      subtitle="Equipment maintenance and service schedule"
      icon="🛠️"
      description="Schedule sensor cleanings, lens calibrations, and track service history."
      features={[
        "Maintenance schedule and reminders",
        "Service history tracking",
        "Warranty expiration alerts",
        "Shutter count and usage tracking",
        "Repair cost tracking",
        "Service provider contacts",
      ]}
      relatedLinks={[
        { label: "Gear", href: "/gear" },
        { label: "Rentals", href: "/rentals" },
        { label: "Expenses", href: "/expenses" },
      ]}
    />
  );
}
