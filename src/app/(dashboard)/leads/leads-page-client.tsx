"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { updatePortfolioInquiryStatus, convertPortfolioInquiryToClient } from "@/lib/actions/portfolio-websites";
import { updateChatInquiryStatus, convertChatInquiryToClient } from "@/lib/actions/chat-inquiries";
import { convertBookingSubmissionToClient } from "@/lib/actions/booking-forms";
import type { LeadStatus, BookingFormSubmissionStatus } from "@prisma/client";

interface PortfolioInquiry {
  id: string;
  portfolioWebsiteId: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: LeadStatus;
  notes: string | null;
  source: string | null;
  createdAt: Date;
  portfolioWebsite: {
    name: string;
    slug: string;
  };
}

interface ChatInquiry {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string;
  category: string | null;
  status: LeadStatus;
  notes: string | null;
  source: string | null;
  pageUrl: string | null;
  createdAt: Date;
}

interface BookingSubmission {
  id: string;
  bookingForm: {
    id: string;
    name: string;
    slug: string;
  };
  data: unknown; // JSON data from form submission
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  preferredDate: Date | null;
  preferredTime: string | null;
  serviceId: string | null;
  status: BookingFormSubmissionStatus;
  booking: {
    id: string;
    title: string;
    startTime: Date;
    status: string;
  } | null;
  convertedAt: Date | null;
  rejectedAt: Date | null;
  rejectionNote: string | null;
  createdAt: Date;
}

interface LeadsPageClientProps {
  portfolioInquiries: PortfolioInquiry[];
  chatInquiries: ChatInquiry[];
  bookingSubmissions: BookingSubmission[];
}

type InquiryType = "all" | "portfolio" | "chat" | "booking";

const STATUS_LABELS: Record<LeadStatus | BookingFormSubmissionStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed: "Closed",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  converted: "Converted",
  expired: "Expired",
};

const STATUS_COLORS: Record<LeadStatus | BookingFormSubmissionStatus, string> = {
  new: "bg-blue-500/10 text-blue-500",
  contacted: "bg-yellow-500/10 text-yellow-500",
  qualified: "bg-green-500/10 text-green-500",
  closed: "bg-gray-500/10 text-gray-400",
  pending: "bg-blue-500/10 text-blue-500",
  approved: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
  converted: "bg-purple-500/10 text-purple-500",
  expired: "bg-gray-500/10 text-gray-400",
};

export function LeadsPageClient({
  portfolioInquiries,
  chatInquiries,
  bookingSubmissions,
}: LeadsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [typeFilter, setTypeFilter] = useState<InquiryType>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<
    | (PortfolioInquiry & { type: "portfolio" })
    | (ChatInquiry & { type: "chat" })
    | (BookingSubmission & { type: "booking" })
    | null
  >(null);

  // Combine and sort all inquiries
  const allInquiries = [
    ...portfolioInquiries.map((i) => ({ ...i, type: "portfolio" as const })),
    ...chatInquiries.map((i) => ({ ...i, type: "chat" as const })),
    ...bookingSubmissions.map((i) => ({ ...i, type: "booking" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Apply filters
  const filteredInquiries = allInquiries.filter((inquiry) => {
    if (typeFilter !== "all" && inquiry.type !== typeFilter) return false;
    if (statusFilter !== "all" && inquiry.status !== statusFilter) return false;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const name = inquiry.type === "booking"
        ? (inquiry as BookingSubmission & { type: "booking" }).clientName
        : (inquiry as PortfolioInquiry | ChatInquiry).name;
      const email = inquiry.type === "booking"
        ? (inquiry as BookingSubmission & { type: "booking" }).clientEmail
        : (inquiry as PortfolioInquiry | ChatInquiry).email;
      const message = inquiry.type === "booking"
        ? ""
        : (inquiry as PortfolioInquiry | ChatInquiry).message;

      const searchableText = [name, email, message].filter(Boolean).join(" ").toLowerCase();
      if (!searchableText.includes(query)) return false;
    }

    return true;
  });

  // Stats
  const stats = {
    total: allInquiries.length,
    new: allInquiries.filter((i) => i.status === "new" || i.status === "pending").length,
    portfolio: portfolioInquiries.length,
    chat: chatInquiries.length,
    booking: bookingSubmissions.length,
  };

  const [convertedClientId, setConvertedClientId] = useState<string | null>(null);

  const handleStatusChange = async (
    inquiry: typeof selectedInquiry,
    newStatus: LeadStatus
  ) => {
    if (!inquiry) return;

    startTransition(async () => {
      if (inquiry.type === "portfolio") {
        await updatePortfolioInquiryStatus(inquiry.id, newStatus);
      } else {
        await updateChatInquiryStatus(inquiry.id, newStatus);
      }
      router.refresh();
      setSelectedInquiry(null);
    });
  };

  const handleConvertToClient = async (inquiry: typeof selectedInquiry) => {
    if (!inquiry) return;

    startTransition(async () => {
      let result;
      if (inquiry.type === "portfolio") {
        result = await convertPortfolioInquiryToClient(inquiry.id);
      } else if (inquiry.type === "chat") {
        result = await convertChatInquiryToClient(inquiry.id);
      } else {
        result = await convertBookingSubmissionToClient(inquiry.id);
      }

      if (result.success && result.clientId) {
        setConvertedClientId(result.clientId);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Leads" value={stats.total} />
        <StatCard label="New/Pending" value={stats.new} color="text-blue-500" />
        <StatCard label="Portfolio" value={stats.portfolio} />
        <StatCard label="Chat" value={stats.chat} />
        <StatCard label="Booking" value={stats.booking} />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-muted">Type:</span>
          <div className="flex rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1">
            {(["all", "portfolio", "chat", "booking"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  typeFilter === type
                    ? "bg-[var(--primary)] text-white"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {type === "all" ? "All" : type === "portfolio" ? "Portfolio" : type === "chat" ? "Chat" : "Booking"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-muted">Status:</span>
          <div className="flex rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1">
            {(["all", "new", "contacted", "qualified", "closed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  statusFilter === status
                    ? "bg-[var(--primary)] text-white"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {status === "all" ? "All" : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        {filteredInquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-foreground-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inquiry) => (
                  <tr
                    key={`${inquiry.type}-${inquiry.id}`}
                    className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--background-hover)]"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                          inquiry.type === "portfolio"
                            ? "bg-purple-500/10 text-purple-400"
                            : inquiry.type === "chat"
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "bg-orange-500/10 text-orange-400"
                        )}
                      >
                        {inquiry.type === "portfolio" ? (
                          <GlobeIcon className="h-3 w-3" />
                        ) : inquiry.type === "chat" ? (
                          <ChatIcon className="h-3 w-3" />
                        ) : (
                          <CalendarIcon className="h-3 w-3" />
                        )}
                        {inquiry.type === "portfolio" ? "Portfolio" : inquiry.type === "chat" ? "Chat" : "Booking"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {inquiry.type === "booking"
                            ? (inquiry as BookingSubmission & { type: "booking" }).clientName || "Anonymous"
                            : (inquiry as PortfolioInquiry | ChatInquiry).name || "Anonymous"}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {inquiry.type === "booking"
                            ? (inquiry as BookingSubmission & { type: "booking" }).clientEmail || "No email"
                            : (inquiry as PortfolioInquiry | ChatInquiry).email || "No email"}
                        </p>
                      </div>
                    </td>
                    <td className="max-w-[300px] px-4 py-3">
                      <p className="truncate text-foreground-secondary">
                        {inquiry.type === "booking"
                          ? (inquiry as BookingSubmission & { type: "booking" }).preferredDate
                            ? `Preferred: ${new Date((inquiry as BookingSubmission & { type: "booking" }).preferredDate!).toLocaleDateString()}`
                            : "Booking request"
                          : (inquiry as PortfolioInquiry | ChatInquiry).message}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-foreground-muted">
                        {inquiry.type === "portfolio" && "portfolioWebsite" in inquiry
                          ? (inquiry as PortfolioInquiry & { type: "portfolio" }).portfolioWebsite.name
                          : inquiry.type === "chat" && "category" in inquiry
                          ? (inquiry as ChatInquiry & { type: "chat" }).category || (inquiry as ChatInquiry & { type: "chat" }).source || "-"
                          : inquiry.type === "booking" && "bookingForm" in inquiry
                          ? (inquiry as BookingSubmission & { type: "booking" }).bookingForm.name
                          : "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_COLORS[inquiry.status]
                        )}
                      >
                        {STATUS_LABELS[inquiry.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground-muted">
                      {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="text-sm text-[var(--primary)] hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageIcon className="mx-auto h-12 w-12 text-foreground-muted" />
            <p className="mt-4 font-medium text-foreground">No leads yet</p>
            <p className="mt-1 text-sm text-foreground-muted">
              Inquiries from your portfolio contact forms and chat widget will appear here
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => {
            setSelectedInquiry(null);
            setConvertedClientId(null);
          }}
          onStatusChange={(status) => handleStatusChange(selectedInquiry, status)}
          onConvertToClient={() => handleConvertToClient(selectedInquiry)}
          isPending={isPending}
          convertedClientId={convertedClientId}
        />
      )}
    </div>
  );
}

// Detail Modal Component
function InquiryDetailModal({
  inquiry,
  onClose,
  onStatusChange,
  onConvertToClient,
  isPending,
  convertedClientId,
}: {
  inquiry:
    | (PortfolioInquiry & { type: "portfolio" })
    | (ChatInquiry & { type: "chat" })
    | (BookingSubmission & { type: "booking" });
  onClose: () => void;
  onStatusChange: (status: LeadStatus) => void;
  onConvertToClient: () => void;
  isPending: boolean;
  convertedClientId: string | null;
}) {
  // Helper to get email based on inquiry type
  const getEmail = () => {
    if (inquiry.type === "booking") {
      return (inquiry as BookingSubmission & { type: "booking" }).clientEmail;
    }
    return (inquiry as PortfolioInquiry | ChatInquiry).email;
  };

  const getName = () => {
    if (inquiry.type === "booking") {
      return (inquiry as BookingSubmission & { type: "booking" }).clientName;
    }
    return (inquiry as PortfolioInquiry | ChatInquiry).name;
  };

  const getPhone = () => {
    if (inquiry.type === "booking") {
      return (inquiry as BookingSubmission & { type: "booking" }).clientPhone;
    }
    return (inquiry as PortfolioInquiry | ChatInquiry).phone;
  };

  const email = getEmail();
  const name = getName();
  const phone = getPhone();

  // Determine if this is a closable status (for hiding convert button)
  const isClosed = inquiry.type === "booking"
    ? ["converted", "rejected", "expired"].includes(inquiry.status)
    : inquiry.status === "closed";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                inquiry.type === "portfolio"
                  ? "bg-purple-500/10 text-purple-400"
                  : inquiry.type === "chat"
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "bg-orange-500/10 text-orange-400"
              )}
            >
              {inquiry.type === "portfolio" ? "Portfolio Inquiry" : inquiry.type === "chat" ? "Chat Message" : "Booking Request"}
            </span>
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                STATUS_COLORS[inquiry.status]
              )}
            >
              {STATUS_LABELS[inquiry.status]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Contact Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium uppercase text-foreground-muted">
                Name
              </label>
              <p className="mt-1 text-foreground">{name || "Anonymous"}</p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase text-foreground-muted">
                Email
              </label>
              <p className="mt-1 text-foreground">
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="text-[var(--primary)] hover:underline"
                  >
                    {email}
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
            {phone && (
              <div>
                <label className="text-xs font-medium uppercase text-foreground-muted">
                  Phone
                </label>
                <p className="mt-1 text-foreground">
                  <a
                    href={`tel:${phone}`}
                    className="text-[var(--primary)] hover:underline"
                  >
                    {phone}
                  </a>
                </p>
              </div>
            )}
            <div>
              <label className="text-xs font-medium uppercase text-foreground-muted">
                Received
              </label>
              <p className="mt-1 text-foreground">
                {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="text-xs font-medium uppercase text-foreground-muted">
              Source
            </label>
            <p className="mt-1 text-foreground-secondary">
              {inquiry.type === "portfolio" && "portfolioWebsite" in inquiry
                ? (inquiry as PortfolioInquiry & { type: "portfolio" }).portfolioWebsite.name
                : inquiry.type === "chat" && "category" in inquiry
                ? `Chat - ${(inquiry as ChatInquiry & { type: "chat" }).category || "General"}`
                : inquiry.type === "booking" && "bookingForm" in inquiry
                ? (inquiry as BookingSubmission & { type: "booking" }).bookingForm.name
                : "Unknown"}
            </p>
          </div>

          {/* Booking-specific details */}
          {inquiry.type === "booking" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {(inquiry as BookingSubmission & { type: "booking" }).preferredDate && (
                <div>
                  <label className="text-xs font-medium uppercase text-foreground-muted">
                    Preferred Date
                  </label>
                  <p className="mt-1 text-foreground">
                    {new Date((inquiry as BookingSubmission & { type: "booking" }).preferredDate!).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
              {(inquiry as BookingSubmission & { type: "booking" }).preferredTime && (
                <div>
                  <label className="text-xs font-medium uppercase text-foreground-muted">
                    Preferred Time
                  </label>
                  <p className="mt-1 text-foreground">
                    {(inquiry as BookingSubmission & { type: "booking" }).preferredTime}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Message (only for portfolio/chat) */}
          {inquiry.type !== "booking" && (
            <div>
              <label className="text-xs font-medium uppercase text-foreground-muted">
                Message
              </label>
              <div className="mt-1 rounded-lg bg-[var(--background-elevated)] p-4">
                <p className="whitespace-pre-wrap text-foreground">
                  {(inquiry as PortfolioInquiry | ChatInquiry).message}
                </p>
              </div>
            </div>
          )}

          {/* Status Actions (only for portfolio/chat) */}
          {inquiry.type !== "booking" && (
            <div>
              <label className="text-xs font-medium uppercase text-foreground-muted">
                Update Status
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["new", "contacted", "qualified", "closed"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(status)}
                    disabled={isPending || inquiry.status === status}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
                      inquiry.status === status
                        ? "bg-[var(--primary)] text-white"
                        : "border border-[var(--card-border)] bg-[var(--background-elevated)] text-foreground hover:bg-[var(--background-hover)]"
                    )}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Booking status info */}
          {inquiry.type === "booking" && (inquiry as BookingSubmission & { type: "booking" }).booking && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <p className="text-sm font-medium text-green-500">Converted to Booking</p>
              <p className="mt-1 text-sm text-foreground-muted">
                This submission has been converted to a booking.
              </p>
              <Link
                href={`/scheduling?booking=${(inquiry as BookingSubmission & { type: "booking" }).booking!.id}`}
                className="mt-2 inline-flex text-sm font-medium text-[var(--primary)] hover:underline"
              >
                View Booking →
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--card-border)] px-6 py-4">
          <div>
            {convertedClientId ? (
              <div className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-500">Converted to client!</span>
                <Link
                  href={`/clients/${convertedClientId}`}
                  className="text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  View Client →
                </Link>
              </div>
            ) : !isClosed ? (
              <button
                onClick={onConvertToClient}
                disabled={isPending || !email}
                className="inline-flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-500 transition-colors hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                title={!email ? "Email required to convert" : undefined}
              >
                <UserPlusIcon className="h-4 w-4" />
                {isPending ? "Converting..." : "Convert to Client"}
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {email && (
              <a
                href={`mailto:${email}?subject=Re: Your inquiry`}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <MailIcon className="h-4 w-4" />
                Reply via Email
              </a>
            )}
            <button
              onClick={onClose}
              className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <p className="text-sm text-foreground-muted">{label}</p>
      <p className={cn("text-2xl font-semibold", color || "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

// Icons
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6c.553 0 1.058.224 1.414.581A2 2 0 0111 8.34v.59a2 2 0 01-.584 1.413l-.12.12a1 1 0 00-.222.495 1 1 0 001.93.297l.122-.303a1.5 1.5 0 012.102-.58c.384.22.689.548.879.944a6.022 6.022 0 01-8.775-3.279z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM7 9a1 1 0 11-2 0 1 1 0 012 0zm7-1a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 21.192a5.973 5.973 0 01-3.003-1.596A5.989 5.989 0 011.053 16.5c-.188-.725-.288-1.488-.288-2.275C.765 9.72 4.795 6 9.765 6c4.97 0 9 3.72 9 8.25-.765-.123-1.553-.373-2.298-.738"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 018 18a9.953 9.953 0 01-5.385-1.572zM16.25 5.75a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
