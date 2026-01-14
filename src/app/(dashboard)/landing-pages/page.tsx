export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function LandingPagesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Landing Pages"
      subtitle="Create custom landing pages for lead generation"
      icon="🌐"
      description="Build landing pages with booking forms, portfolio showcases, and lead capture."
      features={[
        "Drag-and-drop page builder",
        "Pre-built templates for photographers",
        "Booking form integration",
        "Portfolio and gallery sections",
        "Custom domains and SEO",
        "Lead capture and analytics",
      ]}
      relatedLinks={[
        { label: "Booking Page", href: "/booking-page" },
        { label: "Campaigns", href: "/campaigns" },
        { label: "SEO", href: "/seo" },
      ]}
    />
  );
}
