export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getPortfolioByCustomDomain, getPortfolioWebsiteBySlug } from "@/lib/actions/portfolio-websites";
import { PortfolioRenderer } from "../portfolio/[slug]/portfolio-renderer";
import { PasswordGate } from "../portfolio/[slug]/password-gate";
import { ExpiredNotice } from "../portfolio/[slug]/expired-notice";

interface CustomDomainPageProps {
  searchParams: {
    domain?: string;
    path?: string;
  };
}

export default async function CustomDomainPage({ searchParams }: CustomDomainPageProps) {
  const { domain, path } = searchParams;

  if (!domain) {
    notFound();
  }

  // Look up the portfolio by custom domain
  const result = await getPortfolioByCustomDomain(domain);

  if (!result.success || !result.slug) {
    // Domain not found or not verified - show a friendly error
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6" data-element="custom-domain-error-page">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-white">Domain Not Connected</h1>
          <p className="mt-3 text-gray-400">
            The domain <span className="font-medium text-white">{domain}</span> is not
            connected to any portfolio, or the domain verification is pending.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            If you own this domain, please verify it in your portfolio settings.
          </p>
        </div>
      </div>
    );
  }

  // Get the full portfolio data by slug
  const website = await getPortfolioWebsiteBySlug(result.slug);

  if (!website) {
    notFound();
  }

  // Check if portfolio is published
  if (!website.isPublished) {
    notFound();
  }

  // Check if portfolio has expired
  if (website.expiresAt && new Date(website.expiresAt) < new Date()) {
    return <ExpiredNotice websiteName={website.name} />;
  }

  // Check if password protected
  if (website.isPasswordProtected) {
    const cookieStore = await cookies();
    const accessCookie = cookieStore.get(`portfolio-access-${website.slug}`);

    if (!accessCookie || accessCookie.value !== "granted") {
      return <PasswordGate slug={website.slug} websiteName={website.name} />;
    }
  }

  // Transform data to match expected types
  const portfolioData = {
    ...website,
    sections: website.sections.map((section) => ({
      ...section,
      config: section.config as Record<string, unknown>,
    })),
    socialLinks: website.socialLinks as
      | { platform: string; url: string }[]
      | null,
  };

  return <PortfolioRenderer website={portfolioData} />;
}
