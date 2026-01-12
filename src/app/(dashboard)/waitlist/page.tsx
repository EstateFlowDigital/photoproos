export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function WaitlistPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Waitlist"
      subtitle="Booking waitlist management"
      icon="⏳"
      description="Manage waitlisted clients and automatically notify when spots open up."
      features={[
        "Waitlist queue management",
        "Automatic spot notifications",
        "Priority ranking options",
        "Session type preferences",
        "Time-limited offer links",
        "Waitlist analytics",
      ]}
      relatedLinks={[
        { label: "Calendar", href: "/scheduling" },
        { label: "Leads", href: "/leads" },
        { label: "Booking Page", href: "/booking-page" },
      ]}
    />
  );
}
