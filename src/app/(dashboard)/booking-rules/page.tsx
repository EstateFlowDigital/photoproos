import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Rules | PhotoProOS",
  description: "Set rules for automated booking management.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function BookingRulesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Booking Rules"
      subtitle="Configure booking policies and limits"
      icon="⚖️"
      description="Set minimum notice, cancellation policies, and booking limits."
      features={[
        "Minimum notice requirements",
        "Cancellation and rescheduling policies",
        "Daily and weekly booking limits",
        "Deposit requirements",
        "Service-specific rules",
        "Automated policy enforcement",
      ]}
      relatedLinks={[
        { label: "Availability", href: "/availability" },
        { label: "Booking Page", href: "/booking-page" },
        { label: "Services", href: "/services" },
      ]}
    />
  );
}
