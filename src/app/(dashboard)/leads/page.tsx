import { PageHeader } from "@/components/dashboard";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { getPortfolioInquiries } from "@/lib/actions/portfolio-websites";
import { getChatInquiries } from "@/lib/actions/chat-inquiries";
import { getAllSubmissions } from "@/lib/actions/booking-forms";
import { LeadsPageClient } from "./leads-page-client";

export default async function LeadsPage() {
  const organizationId = await requireOrganizationId();

  // Fetch portfolio inquiries, chat inquiries, and booking form submissions
  const [portfolioInquiries, chatInquiries, bookingSubmissions] = await Promise.all([
    getPortfolioInquiries(),
    getChatInquiries(),
    getAllSubmissions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        subtitle="Manage inquiries from your portfolio websites, chat widget, and booking forms"
      />

      <LeadsPageClient
        portfolioInquiries={portfolioInquiries}
        chatInquiries={chatInquiries}
        bookingSubmissions={bookingSubmissions}
      />
    </div>
  );
}
