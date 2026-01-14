export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShotListDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Shot List Details"
      subtitle="Track shots on-site"
      icon="✅"
      description="Check off shots as completed, add notes, and track coverage."
      features={[
        "Interactive shot checklist",
        "Completion tracking",
        "Notes and annotations",
        "Coverage progress bar",
        "Reference image attachment",
        "Share with team members",
      ]}
      relatedLinks={[
        { label: "All Shot Lists", href: "/shot-list" },
        { label: "Projects", href: "/projects" },
      ]}
    />
  );
}
