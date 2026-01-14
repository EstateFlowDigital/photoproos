export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Survey Results"
      subtitle="View survey responses"
      icon="📈"
      description="View individual responses, aggregate scores, and sentiment analysis."
      features={[
        "Individual response viewer",
        "Aggregate score analytics",
        "Sentiment analysis insights",
        "Response rate tracking",
        "Export responses to CSV",
        "Follow-up action triggers",
      ]}
      relatedLinks={[
        { label: "All Surveys", href: "/surveys" },
        { label: "Reviews", href: "/reviews" },
      ]}
    />
  );
}
