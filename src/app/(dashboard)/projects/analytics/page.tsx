import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Analytics | PhotoProOS",
  description: "Track project metrics and completion rates.",
};

export const dynamic = "force-dynamic";

import { PageHeader, PageContextNav } from "@/components/dashboard";
import { getTaskAnalytics } from "@/lib/actions/projects";
import { ProjectsAnalyticsClient } from "./projects-analytics-client";

export default async function ProjectsAnalyticsPage() {
  const result = await getTaskAnalytics();

  return (
    <div className="space-y-6" data-element="projects-analytics-page">
      <PageHeader
        title="Projects Analytics"
        subtitle="Task completion and productivity insights"
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "Board", href: "/projects", icon: <BoardIcon className="h-4 w-4" /> },
          { label: "Analytics", href: "/projects/analytics", icon: <ChartIcon className="h-4 w-4" /> },
        ]}
      />

      {result.success && result.data ? (
        <ProjectsAnalyticsClient analytics={result.data} />
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <ChartIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No task data yet
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Task analytics will appear here once you create tasks in your board.
          </p>
        </div>
      )}
    </div>
  );
}

function BoardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v11.5A2.25 2.25 0 0 0 4.25 18h11.5A2.25 2.25 0 0 0 18 15.75V4.25A2.25 2.25 0 0 0 15.75 2H4.25Zm.5 3.25a.5.5 0 0 1 .5-.5h2.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-.5.5h-2.5a.5.5 0 0 1-.5-.5v-8.5Zm5.5-.5a.5.5 0 0 0-.5.5v5.5a.5.5 0 0 0 .5.5h2.5a.5.5 0 0 0 .5-.5v-5.5a.5.5 0 0 0-.5-.5h-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}
