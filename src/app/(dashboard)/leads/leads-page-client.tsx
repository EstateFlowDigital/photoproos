"use client";

import { useState, useTransition, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { updatePortfolioInquiryStatus, convertPortfolioInquiryToClient, bulkDeletePortfolioInquiries, createManualLead } from "@/lib/actions/portfolio-websites";
import { updateChatInquiryStatus, convertChatInquiryToClient, bulkDeleteChatInquiries } from "@/lib/actions/chat-inquiries";
import { convertBookingSubmissionToClient } from "@/lib/actions/booking-forms";
import type { LeadStatus, BookingFormSubmissionStatus } from "@prisma/client";
import { VirtualList } from "@/components/ui/virtual-list";

// Date type that handles serialization from server to client
type SerializedDate = Date | string;

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
  createdAt: SerializedDate;
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
  createdAt: SerializedDate;
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
  preferredDate: SerializedDate | null;
  preferredTime: string | null;
  serviceId: string | null;
  status: BookingFormSubmissionStatus;
  booking: {
    id: string;
    title: string;
    startTime: SerializedDate;
    status: string;
  } | null;
  convertedAt: SerializedDate | null;
  rejectedAt: SerializedDate | null;
  rejectionNote: string | null;
  createdAt: SerializedDate;
}

interface PortfolioWebsite {
  id: string;
  name: string;
  slug: string;
}

interface LeadsPageClientProps {
  portfolioInquiries: PortfolioInquiry[];
  chatInquiries: ChatInquiry[];
  bookingSubmissions: BookingSubmission[];
  portfolioWebsites: PortfolioWebsite[];
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
  new: "bg-[var(--primary)]/10 text-[var(--primary)]",
  contacted: "bg-[var(--warning)]/10 text-[var(--warning)]",
  qualified: "bg-[var(--success)]/10 text-[var(--success)]",
  closed: "bg-[var(--foreground-muted)]/10 text-foreground-muted",
  pending: "bg-[var(--primary)]/10 text-[var(--primary)]",
  approved: "bg-[var(--success)]/10 text-[var(--success)]",
  rejected: "bg-[var(--error)]/10 text-[var(--error)]",
  converted: "bg-[var(--ai)]/10 text-[var(--ai)]",
  expired: "bg-[var(--foreground-muted)]/10 text-foreground-muted",
};

// Kanban column configuration
const KANBAN_COLUMNS = [
  { id: "new", label: "New", statuses: ["new", "pending"] },
  { id: "contacted", label: "Contacted", statuses: ["contacted", "approved"] },
  { id: "qualified", label: "Qualified", statuses: ["qualified"] },
  { id: "closed", label: "Closed", statuses: ["closed", "converted", "rejected", "expired"] },
] as const;

type SortOption = "newest" | "oldest" | "nameAsc" | "nameDesc";
type DateRangeFilter = "all" | "7days" | "30days" | "90days";

// Union type for combined inquiries
type CombinedInquiry =
  | (PortfolioInquiry & { type: "portfolio" })
  | (ChatInquiry & { type: "chat" })
  | (BookingSubmission & { type: "booking" });

// Memoized row component to prevent unnecessary re-renders in large lists
interface LeadRowProps {
  inquiry: CombinedInquiry;
  onView: (inquiry: CombinedInquiry) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string, type: "portfolio" | "chat" | "booking") => void;
}

const LeadRow = memo(function LeadRow({ inquiry, onView, isSelected, onToggleSelect }: LeadRowProps) {
  const name = inquiry.type === "booking"
    ? (inquiry as BookingSubmission & { type: "booking" }).clientName || "Anonymous"
    : (inquiry as PortfolioInquiry | ChatInquiry).name || "Anonymous";

  const email = inquiry.type === "booking"
    ? (inquiry as BookingSubmission & { type: "booking" }).clientEmail || "No email"
    : (inquiry as PortfolioInquiry | ChatInquiry).email || "No email";

  const messageOrDate = inquiry.type === "booking"
    ? (inquiry as BookingSubmission & { type: "booking" }).preferredDate
      ? `Preferred: ${new Date((inquiry as BookingSubmission & { type: "booking" }).preferredDate!).toLocaleDateString()}`
      : "Booking request"
    : (inquiry as PortfolioInquiry | ChatInquiry).message;

  const source = inquiry.type === "portfolio" && "portfolioWebsite" in inquiry
    ? (inquiry as PortfolioInquiry & { type: "portfolio" }).portfolioWebsite.name
    : inquiry.type === "chat" && "category" in inquiry
    ? (inquiry as ChatInquiry & { type: "chat" }).category || (inquiry as ChatInquiry & { type: "chat" }).source || "-"
    : inquiry.type === "booking" && "bookingForm" in inquiry
    ? (inquiry as BookingSubmission & { type: "booking" }).bookingForm.name
    : "-";

  return (
    <div className={cn(
      "flex flex-col gap-3 border-b border-[var(--card-border)] px-4 py-4 last:border-b-0 hover:bg-[var(--background-hover)] md:grid md:grid-cols-[40px,100px,1.3fr,1.8fr,1fr,100px,130px,80px] md:items-center md:gap-3 md:py-3",
      isSelected && "bg-[var(--primary)]/5"
    )}>
      {/* Mobile: Checkbox + Type in row */}
      <div className="flex items-center justify-between gap-3 md:contents">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect?.(inquiry.id, inquiry.type)}
            className="h-5 w-5 rounded border-[var(--card-border)] bg-[var(--background-elevated)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0 md:h-4 md:w-4"
          />
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
        </div>
        {/* Mobile: View button */}
        <button
          onClick={() => onView(inquiry)}
          className="min-h-[44px] min-w-[44px] rounded-lg bg-[var(--primary)]/10 px-3 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/20 md:hidden"
        >
          View
        </button>
      </div>

      {/* Contact info */}
      <div className="min-w-0 md:contents">
        <div className="md:col-span-1">
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-xs text-foreground-muted">{email}</p>
        </div>
      </div>

      {/* Message - hidden on mobile */}
      <div className="hidden min-w-0 md:block">
        <p className="truncate text-foreground-secondary">{messageOrDate}</p>
      </div>

      {/* Source - hidden on mobile */}
      <div className="hidden md:block">
        <p className="text-xs text-foreground-muted">{source}</p>
      </div>

      {/* Status + Date row on mobile */}
      <div className="flex items-center justify-between gap-2 md:contents">
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
            STATUS_COLORS[inquiry.status]
          )}
        >
          {STATUS_LABELS[inquiry.status]}
        </span>
        <span className="text-xs text-foreground-muted whitespace-nowrap md:text-sm">
          {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Desktop only: View button */}
      <div className="hidden text-right md:block">
        <button
          onClick={() => onView(inquiry)}
          className="text-sm text-[var(--primary)] hover:underline"
        >
          View
        </button>
      </div>
    </div>
  );
});

export function LeadsPageClient({
  portfolioInquiries,
  chatInquiries,
  bookingSubmissions,
  portfolioWebsites,
}: LeadsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // View mode state
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

  // Add Lead Modal state
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  // Filter state
  const [typeFilter, setTypeFilter] = useState<InquiryType>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("all");

  // Drag state for Kanban
  const [draggedInquiry, setDraggedInquiry] = useState<CombinedInquiry | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Bulk selection state
  const [selectedLeadIds, setSelectedLeadIds] = useState<Map<string, "portfolio" | "chat" | "booking">>(new Map());
  const [isBulkActionPending, setIsBulkActionPending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    // Date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      const inquiryDate = new Date(inquiry.createdAt);
      const daysAgo = (now.getTime() - inquiryDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dateRangeFilter === "7days" && daysAgo > 7) return false;
      if (dateRangeFilter === "30days" && daysAgo > 30) return false;
      if (dateRangeFilter === "90days" && daysAgo > 90) return false;
    }

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

  // Apply sorting
  const sortedFilteredInquiries = [...filteredInquiries].sort((a, b) => {
    const getName = (i: CombinedInquiry) =>
      i.type === "booking"
        ? (i as BookingSubmission & { type: "booking" }).clientName || ""
        : (i as PortfolioInquiry | ChatInquiry).name || "";

    switch (sortOption) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "nameAsc":
        return getName(a).localeCompare(getName(b));
      case "nameDesc":
        return getName(b).localeCompare(getName(a));
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Group leads by Kanban column
  const getKanbanColumnLeads = (columnId: string) => {
    const column = KANBAN_COLUMNS.find(c => c.id === columnId);
    if (!column) return [];
    return sortedFilteredInquiries.filter(i => (column.statuses as readonly string[]).includes(i.status));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, inquiry: CombinedInquiry) => {
    setDraggedInquiry(inquiry);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedInquiry || draggedInquiry.type === "booking") {
      setDraggedInquiry(null);
      return;
    }

    // Map column to status
    const statusMap: Record<string, LeadStatus> = {
      new: "new",
      contacted: "contacted",
      qualified: "qualified",
      closed: "closed",
    };

    const newStatus = statusMap[columnId];
    if (!newStatus || draggedInquiry.status === newStatus) {
      setDraggedInquiry(null);
      return;
    }

    startTransition(async () => {
      if (draggedInquiry.type === "portfolio") {
        await updatePortfolioInquiryStatus(draggedInquiry.id, newStatus);
      } else if (draggedInquiry.type === "chat") {
        await updateChatInquiryStatus(draggedInquiry.id, newStatus);
      }
      router.refresh();
      setDraggedInquiry(null);
    });
  };

  // Bulk selection handlers
  const toggleLeadSelection = (id: string, type: "portfolio" | "chat" | "booking") => {
    setSelectedLeadIds(prev => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, type);
      }
      return next;
    });
  };

  const selectAllLeads = () => {
    const allIds = new Map<string, "portfolio" | "chat" | "booking">();
    sortedFilteredInquiries.forEach(i => allIds.set(i.id, i.type));
    setSelectedLeadIds(allIds);
  };

  const clearSelection = () => {
    setSelectedLeadIds(new Map());
  };

  const isAllSelected = sortedFilteredInquiries.length > 0 &&
    sortedFilteredInquiries.every(i => selectedLeadIds.has(i.id));

  // Bulk status change handler
  const handleBulkStatusChange = async (newStatus: LeadStatus) => {
    setIsBulkActionPending(true);

    // Group selected leads by type
    const portfolioIds: string[] = [];
    const chatIds: string[] = [];

    selectedLeadIds.forEach((type, id) => {
      if (type === "portfolio") portfolioIds.push(id);
      else if (type === "chat") chatIds.push(id);
      // Booking status changes handled differently
    });

    try {
      // Update all in parallel
      await Promise.all([
        ...portfolioIds.map(id => updatePortfolioInquiryStatus(id, newStatus)),
        ...chatIds.map(id => updateChatInquiryStatus(id, newStatus)),
      ]);

      router.refresh();
      clearSelection();
    } finally {
      setIsBulkActionPending(false);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    setIsBulkActionPending(true);
    setShowDeleteConfirm(false);

    // Group selected leads by type
    const portfolioIds: string[] = [];
    const chatIds: string[] = [];

    selectedLeadIds.forEach((type, id) => {
      if (type === "portfolio") portfolioIds.push(id);
      else if (type === "chat") chatIds.push(id);
      // Booking submissions are not deleted from leads
    });

    try {
      await Promise.all([
        portfolioIds.length > 0 && bulkDeletePortfolioInquiries(portfolioIds),
        chatIds.length > 0 && bulkDeleteChatInquiries(chatIds),
      ]);

      router.refresh();
      clearSelection();
    } finally {
      setIsBulkActionPending(false);
    }
  };

  // Bulk convert to client handler
  const handleBulkConvertToClient = async () => {
    setIsBulkActionPending(true);

    const results: { success: boolean; id: string }[] = [];

    for (const [id, type] of selectedLeadIds) {
      try {
        if (type === "portfolio") {
          const result = await convertPortfolioInquiryToClient(id);
          results.push({ success: result.success, id });
        } else if (type === "chat") {
          const result = await convertChatInquiryToClient(id);
          results.push({ success: result.success, id });
        } else if (type === "booking") {
          const result = await convertBookingSubmissionToClient(id);
          results.push({ success: result.success, id });
        }
      } catch {
        results.push({ success: false, id });
      }
    }

    router.refresh();
    clearSelection();
    setIsBulkActionPending(false);
  };

  // Stats
  const stats = {
    total: allInquiries.length,
    new: allInquiries.filter((i) => i.status === "new" || i.status === "pending").length,
    portfolio: portfolioInquiries.length,
    chat: chatInquiries.length,
    booking: bookingSubmissions.length,
  };

  const [convertedClientId, setConvertedClientId] = useState<string | null>(null);

  // Memoized callback for viewing inquiries - prevents unnecessary re-renders of LeadRow
  const handleViewInquiry = useCallback((inquiry: CombinedInquiry) => {
    setSelectedInquiry(inquiry);
  }, []);

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

  const handleNotesUpdate = async (inquiry: typeof selectedInquiry, notes: string) => {
    if (!inquiry || inquiry.type === "booking") return;

    startTransition(async () => {
      if (inquiry.type === "portfolio") {
        await updatePortfolioInquiryStatus(inquiry.id, inquiry.status as LeadStatus, notes);
      } else {
        await updateChatInquiryStatus(inquiry.id, inquiry.status as LeadStatus, notes);
      }
      router.refresh();
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
        {/* Add Lead Button */}
        {portfolioWebsites.length > 0 && (
          <button
            onClick={() => setShowAddLeadModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Lead
          </button>
        )}

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

        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "list"
                ? "bg-[var(--primary)] text-white"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            <ListIcon className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setViewMode("board")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "board"
                ? "bg-[var(--primary)] text-white"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            <BoardIcon className="h-4 w-4" />
            Board
          </button>
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

        {/* Date Range Filter */}
        <select
          value={dateRangeFilter}
          onChange={(e) => setDateRangeFilter(e.target.value as DateRangeFilter)}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="all">All Time</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>

        {/* Sort Options */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="nameAsc">Name A-Z</option>
          <option value="nameDesc">Name Z-A</option>
        </select>
      </div>

      {/* Inquiries List or Kanban Board */}
      {viewMode === "list" ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          {sortedFilteredInquiries.length > 0 ? (
            <VirtualList
              className="max-h-[70vh]"
              items={sortedFilteredInquiries}
              getItemKey={(inquiry) => `${inquiry.type}-${inquiry.id}`}
              itemGap={0}
              estimateSize={() => 96}
              prepend={
                <div className="sticky top-0 z-10 hidden border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-3 text-xs font-semibold uppercase text-foreground-muted md:grid md:grid-cols-[40px,100px,1.3fr,1.8fr,1fr,100px,130px,80px] md:items-center md:gap-3">
                  <span className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={() => isAllSelected ? clearSelection() : selectAllLeads()}
                      className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background-elevated)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                    />
                  </span>
                  <span>Type</span>
                  <span>Contact</span>
                  <span>Message</span>
                  <span>Source</span>
                  <span>Status</span>
                  <span>Date</span>
                  <span className="text-right">Actions</span>
                </div>
              }
              renderItem={(inquiry) => (
                <LeadRow
                  key={`${inquiry.type}-${inquiry.id}`}
                  inquiry={inquiry}
                  onView={handleViewInquiry}
                  isSelected={selectedLeadIds.has(inquiry.id)}
                  onToggleSelect={toggleLeadSelection}
                />
              )}
            />
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
      ) : (
        /* Kanban Board View */
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          {KANBAN_COLUMNS.map((column) => {
            const columnLeads = getKanbanColumnLeads(column.id);
            return (
              <div
                key={column.id}
                className={cn(
                  "flex min-w-[280px] flex-shrink-0 flex-col rounded-xl border border-[var(--card-border)] bg-[var(--background-secondary)] sm:min-w-0 sm:flex-shrink",
                  dragOverColumn === column.id && "ring-2 ring-[var(--primary)]"
                )}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      column.id === "new" && "bg-[var(--primary)]",
                      column.id === "contacted" && "bg-[var(--warning)]",
                      column.id === "qualified" && "bg-[var(--success)]",
                      column.id === "closed" && "bg-foreground-muted"
                    )} />
                    <span className="font-medium text-foreground">{column.label}</span>
                  </div>
                  <span className="rounded-full bg-[var(--background-elevated)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Content */}
                <div className="flex-1 space-y-2 overflow-y-auto p-3" style={{ maxHeight: "calc(70vh - 52px)" }}>
                  {columnLeads.length > 0 ? (
                    columnLeads.map((inquiry) => (
                      <KanbanCard
                        key={`${inquiry.type}-${inquiry.id}`}
                        inquiry={inquiry}
                        onView={() => setSelectedInquiry(inquiry)}
                        onDragStart={(e) => handleDragStart(e, inquiry)}
                        isSelected={selectedLeadIds.has(inquiry.id)}
                        onToggleSelect={toggleLeadSelection}
                        isDragging={draggedInquiry?.id === inquiry.id}
                      />
                    ))
                  ) : (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-[var(--card-border)] text-sm text-foreground-muted">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedLeadIds.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-3 shadow-2xl sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:gap-3 sm:px-4">
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            {selectedLeadIds.size} selected
          </span>
          <div className="hidden h-4 w-px bg-[var(--card-border)] sm:block" />
          <select
            disabled={isBulkActionPending}
            onChange={(e) => {
              if (e.target.value) {
                handleBulkStatusChange(e.target.value as LeadStatus);
                e.target.value = "";
              }
            }}
            className="min-h-[44px] rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none disabled:opacity-50 sm:min-h-0 sm:py-1.5"
          >
            <option value="">Change Status...</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={handleBulkConvertToClient}
            disabled={isBulkActionPending}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm font-medium text-green-500 transition-colors hover:bg-green-500/20 disabled:opacity-50 sm:min-h-0 sm:py-1.5"
          >
            <UserPlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Convert to Client</span>
            <span className="sm:hidden">Convert</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isBulkActionPending}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-[var(--error)]/50 bg-[var(--error)]/10 px-3 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20 disabled:opacity-50 sm:min-h-0 sm:py-1.5"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={clearSelection}
            disabled={isBulkActionPending}
            className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted hover:text-foreground disabled:opacity-50 sm:min-h-0 sm:py-1.5"
          >
            Clear
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--error)]/10">
              <TrashIcon className="h-6 w-6 text-[var(--error)]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Delete {selectedLeadIds.size} leads?</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              This action cannot be undone. The selected leads will be permanently removed.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="min-h-[44px] w-full rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] sm:w-auto sm:min-h-0"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkActionPending}
                className="min-h-[44px] w-full rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50 sm:w-auto sm:min-h-0"
              >
                {isBulkActionPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

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
          onNotesUpdate={(notes) => handleNotesUpdate(selectedInquiry, notes)}
          isPending={isPending}
          convertedClientId={convertedClientId}
        />
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <AddLeadModal
          portfolioWebsites={portfolioWebsites}
          onClose={() => setShowAddLeadModal(false)}
          onSuccess={() => {
            setShowAddLeadModal(false);
            router.refresh();
          }}
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
  onNotesUpdate,
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
  onNotesUpdate: (notes: string) => void;
  isPending: boolean;
  convertedClientId: string | null;
}) {
  // Notes state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");

  // Get existing notes
  const getNotes = () => {
    if (inquiry.type === "booking") {
      return (inquiry as BookingSubmission & { type: "booking" }).rejectionNote;
    }
    return (inquiry as PortfolioInquiry | ChatInquiry).notes;
  };

  const existingNotes = getNotes();

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

  const handleSaveNotes = () => {
    onNotesUpdate(editedNotes);
    setIsEditingNotes(false);
  };

  const handleStartEditing = () => {
    setEditedNotes(existingNotes || "");
    setIsEditingNotes(true);
  };
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

          {/* Notes Section (only for portfolio/chat) */}
          {inquiry.type !== "booking" && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase text-foreground-muted">
                  Notes
                </label>
                {!isEditingNotes && (
                  <button
                    onClick={handleStartEditing}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
                  >
                    <NoteIcon className="h-3 w-3" />
                    {existingNotes ? "Edit" : "Add Note"}
                  </button>
                )}
              </div>
              {isEditingNotes ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add internal notes about this lead..."
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] p-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveNotes}
                      disabled={isPending}
                      className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
                    >
                      {isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : existingNotes ? (
                <div className="mt-1 rounded-lg bg-[var(--background-elevated)] p-3">
                  <p className="whitespace-pre-wrap text-sm text-foreground-secondary">
                    {existingNotes}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-sm italic text-foreground-muted">
                  No notes added yet
                </p>
              )}
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

// Kanban Card Component
function KanbanCard({
  inquiry,
  onView,
  onDragStart,
  isSelected,
  onToggleSelect,
  isDragging,
}: {
  inquiry: CombinedInquiry;
  onView: () => void;
  onDragStart: (e: React.DragEvent) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string, type: "portfolio" | "chat" | "booking") => void;
  isDragging?: boolean;
}) {
  const name = inquiry.type === "booking"
    ? (inquiry as BookingSubmission & { type: "booking" }).clientName || "Anonymous"
    : (inquiry as PortfolioInquiry | ChatInquiry).name || "Anonymous";

  const email = inquiry.type === "booking"
    ? (inquiry as BookingSubmission & { type: "booking" }).clientEmail || "No email"
    : (inquiry as PortfolioInquiry | ChatInquiry).email || "No email";

  const isBooking = inquiry.type === "booking";

  return (
    <div
      draggable={!isBooking}
      onDragStart={onDragStart}
      className={cn(
        "group cursor-pointer rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 transition-all",
        isDragging && "opacity-50",
        !isBooking && "hover:border-[var(--primary)]/50",
        isSelected && "ring-2 ring-[var(--primary)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.(inquiry.id, inquiry.type);
            }}
            className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background-elevated)] text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100 focus:ring-[var(--primary)] focus:ring-offset-0"
            style={{ opacity: isSelected ? 1 : undefined }}
          />
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              inquiry.type === "portfolio"
                ? "bg-purple-500/10 text-purple-400"
                : inquiry.type === "chat"
                ? "bg-cyan-500/10 text-cyan-400"
                : "bg-orange-500/10 text-orange-400"
            )}
          >
            {inquiry.type === "portfolio" ? (
              <GlobeIcon className="h-2.5 w-2.5" />
            ) : inquiry.type === "chat" ? (
              <ChatIcon className="h-2.5 w-2.5" />
            ) : (
              <CalendarIcon className="h-2.5 w-2.5" />
            )}
            {inquiry.type === "portfolio" ? "Portfolio" : inquiry.type === "chat" ? "Chat" : "Booking"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="shrink-0 text-xs text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
        >
          View
        </button>
      </div>

      <div className="mt-2" onClick={onView}>
        <p className="font-medium text-foreground">{name}</p>
        <p className="mt-0.5 text-xs text-foreground-muted">{email}</p>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-foreground-muted">
          {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        {isBooking && (
          <span className="text-[10px] text-foreground-muted italic">
            (drag disabled)
          </span>
        )}
      </div>
    </div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
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
        d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.008v.008H3.75V6.75zm0 5.25h.008v.008H3.75V12zm0 5.25h.008v.008H3.75v-.008z"
      />
    </svg>
  );
}

function BoardIcon({ className }: { className?: string }) {
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
        d="M3.75 6.75h16.5M3.75 12h7.5m-7.5 5.25h16.5"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
  );
}

// Add Lead Modal Component
function AddLeadModal({
  portfolioWebsites,
  onClose,
  onSuccess,
}: {
  portfolioWebsites: PortfolioWebsite[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [portfolioWebsiteId, setPortfolioWebsiteId] = useState(portfolioWebsites[0]?.id || "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await createManualLead({
        portfolioWebsiteId,
        name,
        email,
        phone: phone || undefined,
        message: message || undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to create lead");
      }
    } catch (_err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10">
              <UserPlusIcon className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Add New Lead</h2>
              <p className="text-sm text-foreground-muted">Create a manual lead entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          {error && (
            <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 p-3 text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          {/* Portfolio Website */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Portfolio Website <span className="text-[var(--error)]">*</span>
            </label>
            <select
              value={portfolioWebsiteId}
              onChange={(e) => setPortfolioWebsiteId(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              {portfolioWebsites.map((website) => (
                <option key={website.id} value={website.id}>
                  {website.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-foreground-muted">
              Associate this lead with a portfolio website
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Email <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="john@example.com"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Message / Inquiry
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Details about this lead..."
              rows={3}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Internal Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private notes about this lead (not visible to client)..."
              rows={2}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--card-border)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name || !email}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Create Lead
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
