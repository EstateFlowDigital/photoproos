export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function MentoringPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Mentoring"
      subtitle="Offer mentoring and coaching sessions"
      icon="🤝"
      description="Book 1:1 mentoring sessions, share resources, and track mentee progress."
      features={[
        "1:1 mentoring session scheduling",
        "Video call integration (Zoom, Google Meet)",
        "Session packages and pricing tiers",
        "Resource and file sharing with mentees",
        "Progress tracking and session notes",
        "Testimonials and reviews from mentees",
      ]}
      relatedLinks={[
        { label: "Workshops", href: "/workshops" },
        { label: "Courses", href: "/courses" },
        { label: "Calendar", href: "/calendar" },
      ]}
    />
  );
}
