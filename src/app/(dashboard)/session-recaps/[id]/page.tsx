export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionRecapDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Session Recap"
      subtitle="Edit and send recap"
      icon="✨"
      description="Edit recap content, add photos, and send to client."
      features={[
        "Edit and customize recap content",
        "Add sneak peek images",
        "Include next steps and timeline",
        "Preview before sending",
        "Send via email or portal",
        "Track client engagement",
      ]}
      relatedLinks={[
        { label: "All Recaps", href: "/session-recaps" },
        { label: "Projects", href: "/projects" },
      ]}
    />
  );
}
