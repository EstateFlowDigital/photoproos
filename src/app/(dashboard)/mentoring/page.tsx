export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";

export default async function MentoringPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentoring"
        subtitle="Offer mentoring and coaching sessions"
      />

      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🤝</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Coming Soon</h2>
        <p className="text-foreground-muted max-w-md mx-auto mb-8">
          Book 1:1 mentoring sessions, share resources, and track mentee progress.
        </p>

        <div className="text-left max-w-lg mx-auto mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Features included:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>1:1 mentoring session scheduling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Video call integration (Zoom, Google Meet)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Session packages and pricing tiers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Resource and file sharing with mentees</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Progress tracking and session notes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Testimonials and reviews from mentees</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a href="/workshops" className="btn btn-secondary text-sm">Workshops</a>
          <a href="/courses" className="btn btn-secondary text-sm">Courses</a>
          <a href="/calendar" className="btn btn-secondary text-sm">Calendar</a>
        </div>
      </div>
    </div>
  );
}
