export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RevealSessionPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Reveal Session"
      subtitle="In-person sales session"
      icon="🖥️"
      description="Present images, track selections, and process orders in real-time."
      features={[
        "Full-screen image presentation",
        "Real-time selection tracking",
        "Client favorites and comments",
        "Instant order processing",
        "Comparison and side-by-side views",
        "Session summary export",
      ]}
      relatedLinks={[
        { label: "All Sessions", href: "/reveal" },
        { label: "Galleries", href: "/galleries" },
      ]}
    />
  );
}
