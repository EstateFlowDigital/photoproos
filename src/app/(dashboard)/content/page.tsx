export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ContentPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Content Calendar"
      subtitle="Plan and schedule your content"
      icon="📅"
      description="Visual content calendar for planning blog posts, social media, and marketing campaigns."
      features={[
        "Visual calendar with month, week, and day views",
        "Plan blog posts, social media, and email campaigns",
        "Content status tracking (draft, scheduled, published)",
        "Integration with social media scheduling",
        "Content ideas bank and inspiration board",
        "Team collaboration and content approvals",
      ]}
      relatedLinks={[
        { label: "Social Media", href: "/social" },
        { label: "Blog", href: "/blog" },
        { label: "Email Campaigns", href: "/email-campaigns" },
      ]}
    />
  );
}
