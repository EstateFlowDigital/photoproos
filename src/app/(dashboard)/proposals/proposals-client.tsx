"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Copy,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type ProposalStatus = "draft" | "sent" | "viewed" | "accepted" | "expired" | "declined";

interface Proposal {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  status: ProposalStatus;
  createdAt: string;
  sentAt: string | null;
  viewedAt: string | null;
  expiresAt: string | null;
  viewCount: number;
}

// Mock data
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "1",
    title: "Wedding Photography Package",
    clientName: "Sarah & Michael Johnson",
    clientEmail: "sarah.j@email.com",
    amount: 4500,
    status: "viewed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    viewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    viewCount: 3,
  },
  {
    id: "2",
    title: "Corporate Headshots - Tech Startup",
    clientName: "Innovate Labs",
    clientEmail: "hr@innovatelabs.com",
    amount: 1200,
    status: "accepted",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    viewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: null,
    viewCount: 5,
  },
  {
    id: "3",
    title: "Real Estate Photography - Luxury Home",
    clientName: "Premier Realty",
    clientEmail: "listings@premierrealty.com",
    amount: 850,
    status: "sent",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    viewedAt: null,
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    viewCount: 0,
  },
  {
    id: "4",
    title: "Product Photography - E-commerce",
    clientName: "Artisan Goods Co",
    clientEmail: "orders@artisangoods.com",
    amount: 2200,
    status: "draft",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    sentAt: null,
    viewedAt: null,
    expiresAt: null,
    viewCount: 0,
  },
  {
    id: "5",
    title: "Family Portrait Session",
    clientName: "Thompson Family",
    clientEmail: "thompson.fam@email.com",
    amount: 650,
    status: "expired",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    viewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    viewCount: 2,
  },
];

const STATUS_CONFIG: Record<ProposalStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]", icon: FileText },
  sent: { label: "Sent", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10", icon: Send },
  viewed: { label: "Viewed", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10", icon: Eye },
  accepted: { label: "Accepted", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10", icon: CheckCircle2 },
  expired: { label: "Expired", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]", icon: Clock },
  declined: { label: "Declined", color: "text-[var(--error)]", bg: "bg-[var(--error)]/10", icon: XCircle },
};

const FILTER_OPTIONS: { value: ProposalStatus | "all"; label: string }[] = [
  { value: "all", label: "All Proposals" },
  { value: "draft", label: "Drafts" },
  { value: "sent", label: "Sent" },
  { value: "viewed", label: "Viewed" },
  { value: "accepted", label: "Accepted" },
  { value: "expired", label: "Expired" },
];

export function ProposalsClient() {
  const { showToast } = useToast();
  const [proposals] = useState<Proposal[]>(MOCK_PROPOSALS);
  const [filter, setFilter] = useState<ProposalStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const getDaysUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
    return days;
  };

  const filteredProposals = proposals.filter((proposal) => {
    const matchesFilter = filter === "all" || proposal.status === filter;
    const matchesSearch =
      proposal.title.toLowerCase().includes(search.toLowerCase()) ||
      proposal.clientName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === "draft").length,
    pending: proposals.filter((p) => ["sent", "viewed"].includes(p.status)).length,
    accepted: proposals.filter((p) => p.status === "accepted").length,
    totalValue: proposals.reduce((sum, p) => sum + p.amount, 0),
  };

  const handleCopyLink = (proposalId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/proposal/${proposalId}`);
    showToast("Proposal link copied", "success");
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Proposals</p>
            <FileText className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Pending</p>
            <Clock className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{stats.pending}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Accepted</p>
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{stats.accepted}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Value</p>
            <DollarSign className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
            >
              <Filter className="h-4 w-4 text-foreground-muted" />
              {FILTER_OPTIONS.find((f) => f.value === filter)?.label}
              <ChevronDown className="h-4 w-4 text-foreground-muted" />
            </button>
            {showFilterDropdown && (
              <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--background-hover)] ${
                      option.value === filter ? "text-[var(--primary)]" : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <Link href="/proposals/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Proposal
          </Button>
        </Link>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No proposals found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || filter !== "all"
              ? "Try adjusting your search or filter"
              : "Create your first proposal to get started"}
          </p>
          {!search && filter === "all" && (
            <Link href="/proposals/new">
              <Button className="mt-6">
                <Plus className="h-4 w-4 mr-1" />
                Create Proposal
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProposals.map((proposal) => {
            const statusConfig = STATUS_CONFIG[proposal.status];
            const StatusIcon = statusConfig.icon;
            const daysUntilExpiry = getDaysUntilExpiry(proposal.expiresAt);

            return (
              <div key={proposal.id} className="card p-4 hover:bg-[var(--background-hover)] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${statusConfig.bg}`}>
                      <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-foreground truncate">{proposal.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-foreground-muted mt-0.5">{proposal.clientName}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-foreground-muted flex-wrap">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(proposal.amount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created {formatRelativeTime(proposal.createdAt)}
                        </span>
                        {proposal.viewCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {proposal.viewCount} views
                          </span>
                        )}
                        {daysUntilExpiry !== null && daysUntilExpiry > 0 && proposal.status !== "accepted" && (
                          <span className={`flex items-center gap-1 ${daysUntilExpiry <= 2 ? "text-[var(--warning)]" : ""}`}>
                            <Clock className="h-3 w-3" />
                            Expires in {daysUntilExpiry}d
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/proposals/${proposal.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === proposal.id ? null : proposal.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === proposal.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <button
                            onClick={() => handleCopyLink(proposal.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Link
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <ExternalLink className="h-4 w-4" />
                            Preview
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
