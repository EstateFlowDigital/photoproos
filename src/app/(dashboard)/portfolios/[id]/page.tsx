import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import { getPortfolioWebsite } from "@/lib/actions/portfolio-websites";
import { PortfolioDetailClient } from "./portfolio-detail-client";

export default async function PortfolioDetailPage({ params }: { params: { id: string } }) {
  const data = await getPortfolioWebsite(params.id);

  if (!data) {
    redirect("/portfolios");
  }

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

      <PortfolioDetailClient website={data.website} availableProjects={data.availableProjects} />
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
