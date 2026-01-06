export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getPortfolioWebsiteBySlug } from "@/lib/actions/portfolio-websites";
import { PortfolioRenderer } from "./portfolio-renderer";
import { PasswordGate } from "./password-gate";
import { ExpiredNotice } from "./expired-notice";
import { LeadGate } from "./lead-gate";

export default async function PortfolioPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const website = await getPortfolioWebsiteBySlug(slug);

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

  // Check if lead capture is required
  if (website.requireLeadCapture) {
    const cookieStore = await cookies();
    const leadCookie = cookieStore.get(`portfolio-lead-${website.slug}`);

    if (!leadCookie || leadCookie.value !== "granted") {
      return (
        <LeadGate
          slug={website.slug}
          websiteName={website.name}
          message={website.leadCaptureMessage}
          primaryColor={website.primaryColor}
        />
      );
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
