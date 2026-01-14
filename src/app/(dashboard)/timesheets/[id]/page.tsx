export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TimesheetDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Timesheet Details"
      subtitle="Review and approve hours"
      icon="📝"
      description="Review time entries, approve hours, and add notes for payroll processing."
      features={[
        "Time entry review and approval",
        "Hours breakdown by project and task",
        "Overtime and billable hours tracking",
        "Notes and comments for payroll",
        "Export to payroll systems",
        "Historical timesheet comparison",
      ]}
      relatedLinks={[
        { label: "All Timesheets", href: "/timesheets" },
        { label: "Team", href: "/team" },
        { label: "Team Reports", href: "/reports/team" },
      ]}
    />
  );
}
