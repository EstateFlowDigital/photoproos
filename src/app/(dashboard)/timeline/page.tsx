export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function TimelinePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Event Timeline"
      subtitle="Create and manage event day timelines"
      icon="📅"
      description="Build detailed event timelines with vendor coordination and client sharing."
      features={[
        "Visual timeline builder",
        "Time block scheduling",
        "Vendor coordination and assignments",
        "Client and vendor sharing",
        "PDF export for print",
        "Mobile access for day-of reference",
      ]}
      relatedLinks={[
        { label: "Projects", href: "/projects" },
        { label: "Shot List", href: "/shot-list" },
        { label: "Calendar", href: "/calendar" },
      ]}
    />
  );
}
