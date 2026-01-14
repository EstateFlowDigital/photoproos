export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReleaseDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Release Details"
      subtitle="View signed release"
      icon="📄"
      description="View signed release, download PDF, and manage associated media."
      features={[
        "View signed release document",
        "Download as PDF",
        "Associated media management",
        "Signature verification",
        "Resend for signature",
        "Usage tracking and expiration",
      ]}
      relatedLinks={[
        { label: "All Releases", href: "/releases" },
        { label: "Contracts", href: "/contracts" },
      ]}
    />
  );
}
