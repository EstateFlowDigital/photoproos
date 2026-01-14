export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SegmentDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Segment"
      subtitle="Segment members and criteria"
      icon="🎯"
      description="View segment members, edit criteria, and launch targeted campaigns."
      features={[
        "View all segment members",
        "Edit segmentation criteria",
        "Launch targeted campaigns",
        "Real-time member count updates",
        "Export segment list",
        "Segment performance analytics",
      ]}
      relatedLinks={[
        { label: "All Segments", href: "/segments" },
        { label: "Campaigns", href: "/email-campaigns" },
      ]}
    />
  );
}
