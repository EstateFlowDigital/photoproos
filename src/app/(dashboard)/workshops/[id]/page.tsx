export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkshopDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Workshop Details"
      subtitle="Manage workshop"
      icon="📅"
      description="Manage attendees, send materials, and track attendance."
      features={[
        "Attendee management and check-in",
        "Material distribution and downloads",
        "Attendance tracking",
        "Communication with attendees",
        "Post-workshop feedback collection",
        "Revenue and payment tracking",
      ]}
      relatedLinks={[
        { label: "All Workshops", href: "/workshops" },
        { label: "Courses", href: "/courses" },
      ]}
    />
  );
}
