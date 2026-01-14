export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function GettingStartedPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Getting Started"
      subtitle="Quick start guide for new users"
      icon="🚀"
      description="Step-by-step onboarding guide to set up your account and start booking clients."
      features={[
        "Interactive onboarding checklist",
        "Account setup wizard",
        "Service and pricing configuration",
        "Calendar and availability setup",
        "First client and project walkthrough",
        "Quick tips for productivity",
      ]}
      relatedLinks={[
        { label: "Help Center", href: "/help" },
        { label: "Video Tutorials", href: "/help/videos" },
        { label: "Dashboard", href: "/dashboard" },
      ]}
    />
  );
}
