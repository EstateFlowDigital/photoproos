import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shot Lists | PhotoProOS",
  description: "Create and manage shot lists for photography sessions.",
};

export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ShotListPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Shot Lists"
      subtitle="Create and manage shot lists for shoots"
      icon="📸"
      description="Build shot lists with references, track completion on-site, and share with clients."
      features={[
        "Custom shot list templates by session type",
        "Reference image attachments",
        "On-site completion tracking",
        "Client collaboration and requests",
        "Mobile-friendly checklist view",
        "Export and print options",
      ]}
      relatedLinks={[
        { label: "Projects", href: "/projects" },
        { label: "Timeline", href: "/timeline" },
        { label: "Questionnaires", href: "/questionnaires" },
      ]}
    />
  );
}
