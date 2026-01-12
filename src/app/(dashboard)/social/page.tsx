export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function SocialPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Social Media"
      subtitle="Manage social media content and scheduling"
      icon="📱"
      description="Schedule posts, track engagement, and manage multiple social accounts in one place."
      features={[
        "Connect Instagram, Facebook, Pinterest, and more",
        "Visual content calendar with drag-and-drop scheduling",
        "Auto-post from galleries with client permission",
        "Best time to post recommendations",
        "Engagement analytics and follower growth tracking",
        "Hashtag suggestions and caption templates",
      ]}
      relatedLinks={[
        { label: "Content Calendar", href: "/content" },
        { label: "Galleries", href: "/galleries" },
        { label: "Campaigns", href: "/campaigns" },
      ]}
    />
  );
}
