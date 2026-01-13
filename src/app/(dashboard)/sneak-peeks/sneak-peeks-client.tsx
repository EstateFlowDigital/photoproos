"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Share2,
  Send,
  Image,
  Clock,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SneakPeek {
  id: string;
  title: string;
  project: string;
  client: string;
  status: "draft" | "scheduled" | "sent" | "viewed";
  imageCount: number;
  scheduledFor: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  views: number;
  socialPermission: boolean;
  createdAt: string;
}

const statusConfig = {
  draft: { label: "Draft", color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-secondary)]" },
  scheduled: { label: "Scheduled", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  sent: { label: "Sent", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  viewed: { label: "Viewed", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
};

const mockSneakPeeks: SneakPeek[] = [
  {
    id: "1",
    title: "Wedding Day Highlights",
    project: "Mitchell Wedding",
    client: "Sarah Mitchell",
    status: "viewed",
    imageCount: 8,
    scheduledFor: null,
    sentAt: "2025-01-08T14:00:00",
    viewedAt: "2025-01-08T14:32:00",
    views: 12,
    socialPermission: true,
    createdAt: "2025-01-08",
  },
  {
    id: "2",
    title: "Same Day Edit Preview",
    project: "Johnson Engagement",
    client: "Mike Johnson",
    status: "sent",
    imageCount: 5,
    scheduledFor: null,
    sentAt: "2025-01-11T10:30:00",
    viewedAt: null,
    views: 0,
    socialPermission: true,
    createdAt: "2025-01-11",
  },
  {
    id: "3",
    title: "Product Shoot Teaser",
    project: "TechCorp Product Launch",
    client: "TechCorp Inc",
    status: "scheduled",
    imageCount: 6,
    scheduledFor: "2025-01-13T09:00:00",
    sentAt: null,
    viewedAt: null,
    views: 0,
    socialPermission: false,
    createdAt: "2025-01-10",
  },
  {
    id: "4",
    title: "Family Portrait Preview",
    project: "Roberts Family Session",
    client: "Emily Roberts",
    status: "draft",
    imageCount: 4,
    scheduledFor: null,
    sentAt: null,
    viewedAt: null,
    views: 0,
    socialPermission: true,
    createdAt: "2025-01-12",
  },
  {
    id: "5",
    title: "Event Recap Sneak Peek",
    project: "Annual Gala 2025",
    client: "City Foundation",
    status: "viewed",
    imageCount: 10,
    scheduledFor: null,
    sentAt: "2025-01-06T16:00:00",
    viewedAt: "2025-01-06T18:45:00",
    views: 34,
    socialPermission: true,
    createdAt: "2025-01-06",
  },
];

export function SneakPeeksClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredSneakPeeks = mockSneakPeeks.filter((peek) => {
    const matchesSearch =
      peek.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      peek.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      peek.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || peek.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalViews = mockSneakPeeks.reduce((sum, p) => sum + p.views, 0);
  const totalImages = mockSneakPeeks.reduce((sum, p) => sum + p.imageCount, 0);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleCreate = () => {
    toast({
      title: "Create Sneak Peek",
      description: "Opening sneak peek editor...",
    });
  };

  const handleAction = (action: string, peek: SneakPeek) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for "${peek.title}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Eye className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockSneakPeeks.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Sneak Peeks</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <CheckCircle className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">
                {mockSneakPeeks.filter((p) => p.status === "viewed").length}
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">Viewed</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <Image className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalImages}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Images</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ai)]/10">
              <Eye className="h-5 w-5 text-[var(--ai)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalViews}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search sneak peeks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
          </select>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Sneak Peek
        </button>
      </div>

      {/* Sneak Peeks List */}
      <div className="space-y-4">
        {filteredSneakPeeks.map((peek) => (
          <div
            key={peek.id}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]/30 transition-colors"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Main Info */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
                  <Image className="h-6 w-6 text-[var(--foreground-muted)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--foreground)]">{peek.title}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[peek.status].bg} ${statusConfig[peek.status].color}`}>
                      {statusConfig[peek.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {peek.project} • {peek.client}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                    <span className="flex items-center gap-1">
                      <Image className="h-3 w-3" />
                      {peek.imageCount} images
                    </span>
                    {peek.socialPermission && (
                      <span className="flex items-center gap-1 text-[var(--success)]">
                        <Share2 className="h-3 w-3" />
                        Social sharing enabled
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="flex items-center gap-6">
                <div className="text-sm">
                  {peek.status === "scheduled" ? (
                    <div className="text-center">
                      <p className="text-[var(--foreground)]">{formatDate(peek.scheduledFor)}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">Scheduled</p>
                    </div>
                  ) : peek.status === "sent" || peek.status === "viewed" ? (
                    <div className="text-center">
                      <p className="text-[var(--foreground)]">{formatDate(peek.sentAt)}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">Sent</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-[var(--foreground)]">—</p>
                      <p className="text-xs text-[var(--foreground-muted)]">Not sent</p>
                    </div>
                  )}
                </div>

                {peek.status === "viewed" && (
                  <div className="text-sm text-center">
                    <p className="text-[var(--foreground)]">{peek.views}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">Views</p>
                  </div>
                )}

                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === peek.id ? null : peek.id)}
                    className="rounded p-2 hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5 text-[var(--foreground-muted)]" />
                  </button>
                  {openMenuId === peek.id && (
                    <div className="absolute right-0 top-10 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                      <button
                        onClick={() => handleAction("Preview", peek)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Eye className="h-4 w-4" /> Preview
                      </button>
                      <button
                        onClick={() => handleAction("Edit", peek)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      {peek.status === "draft" && (
                        <button
                          onClick={() => handleAction("Send Now", peek)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Send className="h-4 w-4" /> Send Now
                        </button>
                      )}
                      {peek.status === "draft" && (
                        <button
                          onClick={() => handleAction("Schedule", peek)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Clock className="h-4 w-4" /> Schedule
                        </button>
                      )}
                      {(peek.status === "sent" || peek.status === "viewed") && (
                        <button
                          onClick={() => handleAction("View Link", peek)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <ExternalLink className="h-4 w-4" /> View Link
                        </button>
                      )}
                      <button
                        onClick={() => handleAction("Copy Link", peek)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Share2 className="h-4 w-4" /> Copy Link
                      </button>
                      <hr className="my-1 border-[var(--card-border)]" />
                      <button
                        onClick={() => handleAction("Delete", peek)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSneakPeeks.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <Eye className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No sneak peeks found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create a sneak peek to share quick previews with clients"}
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            Create Sneak Peek
          </button>
        </div>
      )}
    </div>
  );
}
