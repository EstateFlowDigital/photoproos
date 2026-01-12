export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function SegmentsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="segments-page">
      <ComingSoonPage
        title="Client Segments"
        subtitle="Group clients for targeted marketing"
        icon="👥"
        description="Create dynamic segments based on behavior, spending, and engagement."
        features={[
          "Dynamic segments that auto-update",
          "Filter by lifetime value, recency, frequency",
          "Session type and service preferences",
          "Email engagement and open rates",
          "Target segments in email campaigns",
          "Win-back segments for inactive clients",
        ]}
        relatedLinks={[
          { label: "Clients", href: "/clients" },
          { label: "Email Campaigns", href: "/email-campaigns" },
          { label: "VIP Clients", href: "/vip" },
        ]}
      />
    </div>
  );
}
