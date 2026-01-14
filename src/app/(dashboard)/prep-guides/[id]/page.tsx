export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrepGuideDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Prep Guide"
      subtitle="Edit guide content"
      icon="📋"
      description="Edit guide content with images, tips, and downloadable PDF export."
      features={[
        "Rich content editor",
        "Image and gallery embedding",
        "Tips and recommendations",
        "PDF export and download",
        "Client portal sharing",
        "Session type customization",
      ]}
      relatedLinks={[
        { label: "All Guides", href: "/prep-guides" },
        { label: "Questionnaires", href: "/questionnaires" },
      ]}
    />
  );
}
