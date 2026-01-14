export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Team"
      subtitle="Manage team members and roles"
      icon="👥"
      description="Add team members, assign roles, and manage permissions across your organization."
      features={[
        "Invite team members with custom roles",
        "Role-based permissions (admin, editor, viewer)",
        "Second shooter and associate profiles",
        "Team availability and calendar sync",
        "Assignment tracking and workload balancing",
        "Team performance analytics",
      ]}
      relatedLinks={[
        { label: "Associates", href: "/associates" },
        { label: "Assignments", href: "/assignments" },
        { label: "Timesheets", href: "/timesheets" },
      ]}
    />
  );
}
