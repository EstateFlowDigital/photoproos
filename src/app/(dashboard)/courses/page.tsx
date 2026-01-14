export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function CoursesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Courses"
      subtitle="Educational content and tutorials"
      icon="🎓"
      description="Access courses on photography, business, and using the platform effectively."
      features={[
        "Create and sell online courses",
        "Video lessons with progress tracking",
        "Downloadable course materials",
        "Quizzes and assignments",
        "Certificates of completion",
        "Student enrollment management",
      ]}
      relatedLinks={[
        { label: "Workshops", href: "/workshops" },
        { label: "Mentoring", href: "/mentoring" },
        { label: "Digital Products", href: "/digital-products" },
      ]}
    />
  );
}
