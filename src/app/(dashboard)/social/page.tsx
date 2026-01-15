import { Metadata } from "next";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { SocialClient } from "./social-client";

export const metadata: Metadata = {
  title: "Social Media | PhotoProOS",
  description: "Schedule and manage social media posts.",
};

export const dynamic = "force-dynamic";

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
