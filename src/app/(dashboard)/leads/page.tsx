import { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata: Metadata = {
  title: "Leads | PhotoProOS",
  description: "Track and manage potential client leads and inquiries.",
};
import { PageContextNav } from "@/components/dashboard/page-context-nav";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { getPortfolioInquiries, getPortfolioWebsitesForLeadCreation } from "@/lib/actions/portfolio-websites";
import { getChatInquiries } from "@/lib/actions/chat-inquiries";
import { getAllSubmissions } from "@/lib/actions/booking-forms";
import { LeadsPageClient } from "./leads-page-client";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";

export default async function LeadsPage() {
  const _organizationId = await requireOrganizationId();

  // Fetch portfolio inquiries, chat inquiries, booking form submissions, portfolio websites, and walkthrough preference
  const [portfolioInquiries, chatInquiries, bookingSubmissions, portfolioWebsites, walkthroughPreferenceResult] = await Promise.all([
    getPortfolioInquiries(),
    getChatInquiries(),
    getAllSubmissions(),
    getPortfolioWebsitesForLeadCreation(),
    getWalkthroughPreference("leads"),
  ]);

  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  return (
    <div className="space-y-6" data-element="leads-page">
      <WalkthroughWrapper pageId="leads" initialState={walkthroughState} />
      <PageHeader
        title="Leads"
        subtitle="Manage inquiries from your portfolio websites, chat widget, and booking forms"
      />

      <PageContextNav
        items={[
          { label: "All Leads", href: "/leads", icon: <LeadsIcon className="h-4 w-4" /> },
          { label: "Analytics", href: "/leads/analytics", icon: <ChartIcon className="h-4 w-4" /> },
        ]}
      />

      <LeadsPageClient
        portfolioInquiries={portfolioInquiries}
        chatInquiries={chatInquiries}
        bookingSubmissions={bookingSubmissions}
        portfolioWebsites={portfolioWebsites}
      />
    </div>
  );
}

function LeadsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
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
