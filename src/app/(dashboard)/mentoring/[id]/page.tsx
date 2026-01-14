export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MentoringSessionPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Mentoring Session"
      subtitle="Session details and notes"
      icon="💬"
      description="Session notes, action items, and follow-up scheduling."
      features={[
        "Session notes and recordings",
        "Action items and tasks",
        "Follow-up scheduling",
        "Resource sharing",
        "Progress tracking",
        "Mentee communication",
      ]}
      relatedLinks={[
        { label: "All Sessions", href: "/mentoring" },
        { label: "Calendar", href: "/calendar" },
      ]}
    />
  );
}
