export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SneakPeekDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Sneak Peek"
      subtitle="Preview sharing"
      icon="✨"
      description="Select preview images, set expiration, and share with client."
      features={[
        "Select and curate preview images",
        "Set expiration date",
        "Custom sharing links",
        "Download and watermark settings",
        "Social sharing options",
        "View tracking analytics",
      ]}
      relatedLinks={[
        { label: "All Sneak Peeks", href: "/sneak-peeks" },
        { label: "Projects", href: "/projects" },
      ]}
    />
  );
}
