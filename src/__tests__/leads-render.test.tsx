import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

vi.mock("@/lib/actions/portfolio-websites", () => ({
  updatePortfolioInquiryStatus: vi.fn(),
  convertPortfolioInquiryToClient: vi.fn(() => ({ success: true, clientId: "client-1" })),
  bulkDeletePortfolioInquiries: vi.fn(),
  createManualLead: vi.fn(() => ({ success: true })),
}));

vi.mock("@/lib/actions/chat-inquiries", () => ({
  updateChatInquiryStatus: vi.fn(),
  convertChatInquiryToClient: vi.fn(() => ({ success: true, clientId: "client-2" })),
  bulkDeleteChatInquiries: vi.fn(),
}));

vi.mock("@/lib/actions/booking-forms", () => ({
  convertBookingSubmissionToClient: vi.fn(() => ({ success: true, clientId: "client-3" })),
}));

import { LeadsPageClient } from "@/app/(dashboard)/leads/leads-page-client";
import { expect } from "vitest";

const sampleProps = {
  portfolioInquiries: [
    {
      id: "p1",
      portfolioWebsiteId: "site1",
      name: "Pat Portfolio",
      email: "pat@example.com",
      phone: null,
      message: "Hello",
      status: "new",
      notes: null,
      source: "contact",
      createdAt: new Date().toISOString(),
      portfolioWebsite: { name: "Site", slug: "site" },
    },
  ] as any,
  chatInquiries: [],
  bookingSubmissions: [],
  portfolioWebsites: [{ id: "site1", name: "Site", slug: "site" }] as any,
};

describe("LeadsPageClient", () => {
  it("renders with sample data", () => {
    render(<LeadsPageClient {...sampleProps} />);
  });

  it("allows selecting all", () => {
    const { getAllByRole } = render(<LeadsPageClient {...sampleProps} />);
    const headerCheckbox = getAllByRole("checkbox")[0];
    fireEvent.click(headerCheckbox);
    expect(headerCheckbox).toBeChecked();
  });
});
