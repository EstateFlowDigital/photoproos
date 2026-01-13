export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { SocialClient } from "./social-client";

export default async function SocialPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="social-page">
      <PageHeader
        title="Social Media"
        subtitle="Manage social media content and scheduling"
      />

      <SocialClient />
    </div>
  );
}
