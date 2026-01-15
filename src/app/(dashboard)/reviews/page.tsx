import { Metadata } from "next";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { ReviewsClient } from "./reviews-client";

export const metadata: Metadata = {
  title: "Reviews | PhotoProOS",
  description: "Collect and manage client reviews and testimonials.",
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6" data-element="reviews-page">
      <PageHeader
        title="Reviews"
        subtitle="Manage client reviews and testimonials"
      />

      <ReviewsClient />
    </div>
  );
}
