export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function ReviewsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div data-element="reviews-page">
      <ComingSoonPage
        title="Reviews"
        subtitle="Manage client reviews and testimonials"
        icon="⭐"
        description="Collect reviews, display testimonials, and sync with Google and Yelp."
        features={[
          "Automated review request emails",
          "Google and Yelp review integration",
          "Testimonial collection and display",
          "Video testimonial hosting",
          "Review widgets for your website",
          "Response management and alerts",
        ]}
        relatedLinks={[
          { label: "Surveys", href: "/surveys" },
          { label: "Referrals", href: "/referrals" },
          { label: "Automations", href: "/automations" },
        ]}
      />
    </div>
  );
}
