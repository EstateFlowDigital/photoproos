export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function BookingSettingsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Booking Settings"
      subtitle="Configure booking behavior"
      icon="📅"
      description="Set default booking durations, reminders, and confirmation settings."
      features={[
        "Default session durations and buffers",
        "Automatic confirmation emails",
        "Reminder notification timing",
        "Calendar sync preferences",
        "Time zone settings",
        "Double-booking prevention",
      ]}
      relatedLinks={[
        { label: "Settings", href: "/settings" },
        { label: "Booking Page", href: "/booking-page" },
        { label: "Availability", href: "/availability" },
      ]}
    />
  );
}
