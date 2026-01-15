import { Metadata } from "next";
import { ComingSoonPage } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Workshops | PhotoProOS",
  description: "Host and manage photography workshops.",
};

export const dynamic = "force-dynamic";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function WorkshopsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Workshops"
      subtitle="Create and sell photography workshops"
      icon="🎓"
      description="Schedule workshops, manage registrations, and process payments."
      features={[
        "Workshop creation with dates and pricing",
        "Online registration and payment processing",
        "Attendee management and check-in",
        "Waitlist and capacity management",
        "Workshop materials and resource sharing",
        "Post-workshop surveys and certificates",
      ]}
      relatedLinks={[
        { label: "Mentoring", href: "/mentoring" },
        { label: "Courses", href: "/courses" },
        { label: "Calendar", href: "/calendar" },
      ]}
    />
  );
}
