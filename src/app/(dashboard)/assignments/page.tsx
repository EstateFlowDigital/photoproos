import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assignments | PhotoProOS",
  description: "Manage team task assignments.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function AssignmentsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Job Assignments"
      subtitle="Assign team members to shoots"
      icon="📋"
      description="Drag-and-drop assignment board for scheduling team members on jobs."
      features={[
        "Visual drag-and-drop assignment board",
        "Team member availability checking",
        "Assignment notifications and confirmations",
        "Skill-based assignment suggestions",
        "Conflict detection and resolution",
        "Assignment history and reporting",
      ]}
      relatedLinks={[
        { label: "Team", href: "/team" },
        { label: "Calendar", href: "/calendar" },
        { label: "Projects", href: "/projects" },
      ]}
    />
  );
}
