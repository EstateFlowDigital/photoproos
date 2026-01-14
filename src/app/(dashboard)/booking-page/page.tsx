export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function BookingPageSettingsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Booking Page"
      subtitle="Customize your public booking page"
      icon="🌐"
      description="Design your public booking page with branding, services, and availability."
      features={[
        "Custom branded booking page",
        "Session type selection",
        "Calendar availability display",
        "Custom domain support",
        "Portfolio showcase integration",
        "Intake questionnaire forms",
      ]}
      relatedLinks={[
        { label: "Availability", href: "/availability" },
        { label: "Booking Rules", href: "/booking-rules" },
        { label: "Services", href: "/services" },
      ]}
    />
  );
}
