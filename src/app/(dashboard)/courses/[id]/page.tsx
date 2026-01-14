export const dynamic = "force-dynamic";
import { ComingSoonPage } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  await params;
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <ComingSoonPage
      title="Course"
      subtitle="Course content and students"
      icon="▶️"
      description="Video lessons with progress tracking and completion certificates."
      features={[
        "Video lessons and modules",
        "Progress tracking per student",
        "Completion certificates",
        "Student enrollment management",
        "Discussion and Q&A section",
        "Revenue and sales analytics",
      ]}
      relatedLinks={[
        { label: "All Courses", href: "/courses" },
        { label: "Digital Products", href: "/digital-products" },
      ]}
    />
  );
}
