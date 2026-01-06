import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import { getPortfolioWebsite, getPortfolioAnalytics } from "@/lib/actions/portfolio-websites";
import { PortfolioEditorClient } from "./portfolio-editor-client";

export default async function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, analyticsResult] = await Promise.all([
    getPortfolioWebsite(id),
    getPortfolioAnalytics(id, "30d"),
  ]);

  if (!data) {
    redirect("/portfolios");
  }

  // Transform sections to match expected type
  const website = {
    ...data.website,
    sections: data.website.sections.map((section) => ({
      ...section,
      config: section.config as Record<string, unknown>,
    })),
    socialLinks: data.website.socialLinks as { platform: string; url: string }[] | null,
  };

  // Get quick stats for header
  const quickStats = analyticsResult.success && analyticsResult.data
    ? {
        totalViews: analyticsResult.data.totalViews,
        uniqueVisitors: analyticsResult.data.uniqueVisitors,
        lastUpdated: data.website.updatedAt,
      }
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.website.name}
        subtitle={data.website.isPublished ? "Published portfolio website" : "Draft portfolio website"}
        actions={
          <Link
            href="/portfolios"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Portfolios
          </Link>
        }
      />

      <PortfolioEditorClient
        website={website}
        availableProjects={data.availableProjects}
        quickStats={quickStats}
      />
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}
