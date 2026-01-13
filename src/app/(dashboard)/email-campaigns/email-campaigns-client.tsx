"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Send,
  Users,
  Eye,
  MousePointer,
  Clock,
  Copy,
  Trash2,
  BarChart3,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sent" | "sending";
  type: "newsletter" | "promotional" | "announcement" | "automated";
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "January Newsletter",
    subject: "New Year, New Photos - January Update",
    status: "sent",
    type: "newsletter",
    recipients: 1250,
    sent: 1248,
    opened: 542,
    clicked: 128,
    scheduledFor: null,
    sentAt: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-10T14:30:00Z",
  },
  {
    id: "2",
    name: "Valentine's Mini Sessions",
    subject: "Book Your Valentine's Mini Session - Limited Spots!",
    status: "scheduled",
    type: "promotional",
    recipients: 890,
    sent: 0,
    opened: 0,
    clicked: 0,
    scheduledFor: "2024-02-01T09:00:00Z",
    sentAt: null,
    createdAt: "2024-01-20T11:00:00Z",
  },
  {
    id: "3",
    name: "Spring Booking Announcement",
    subject: "Spring 2024 Calendar Now Open",
    status: "draft",
    type: "announcement",
    recipients: 1500,
    sent: 0,
    opened: 0,
    clicked: 0,
    scheduledFor: null,
    sentAt: null,
    createdAt: "2024-01-22T16:00:00Z",
  },
  {
    id: "4",
    name: "Gallery Delivery Notice",
    subject: "Your Gallery is Ready to View!",
    status: "sending",
    type: "automated",
    recipients: 45,
    sent: 32,
    opened: 18,
    clicked: 12,
    scheduledFor: null,
    sentAt: null,
    createdAt: "2024-01-18T09:00:00Z",
  },
  {
    id: "5",
    name: "Holiday Promo 2023",
    subject: "Holiday Gift Cards - 20% Off!",
    status: "sent",
    type: "promotional",
    recipients: 1100,
    sent: 1098,
    opened: 612,
    clicked: 245,
    scheduledFor: null,
    sentAt: "2023-12-01T08:00:00Z",
    createdAt: "2023-11-25T14:00:00Z",
  },
];

const statusConfig = {
  draft: { label: "Draft", color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-tertiary)]" },
  scheduled: { label: "Scheduled", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  sending: { label: "Sending", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  sent: { label: "Sent", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
};

const typeConfig = {
  newsletter: { label: "Newsletter", color: "text-[var(--primary)]" },
  promotional: { label: "Promotional", color: "text-[var(--warning)]" },
  announcement: { label: "Announcement", color: "text-[var(--info)]" },
  automated: { label: "Automated", color: "text-[var(--ai)]" },
};

export function EmailCampaignsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockCampaigns.length,
    sent: mockCampaigns.filter((c) => c.status === "sent").length,
    scheduled: mockCampaigns.filter((c) => c.status === "scheduled").length,
    avgOpenRate: Math.round(
      (mockCampaigns.filter((c) => c.status === "sent").reduce((acc, c) => acc + (c.opened / c.sent) * 100, 0) /
        mockCampaigns.filter((c) => c.status === "sent").length) || 0
    ),
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <Mail className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Campaigns</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--success)]/10">
              <Send className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Sent</p>
              <p className="text-2xl font-semibold">{stats.sent}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--info)]/10">
              <Clock className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Scheduled</p>
              <p className="text-2xl font-semibold">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--warning)]/10">
              <Eye className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Avg Open Rate</p>
              <p className="text-2xl font-semibold">{stats.avgOpenRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
          </select>
          <button
            onClick={() =>
              toast({
                title: "Create Campaign",
                description: "Opening campaign builder...",
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--background-tertiary)] border-b border-[var(--border)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Campaign</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Recipients</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Open Rate</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Click Rate</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredCampaigns.map((campaign) => {
              const status = statusConfig[campaign.status];
              const type = typeConfig[campaign.type];
              const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
              const clickRate = campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0;

              return (
                <tr key={campaign.id} className="hover:bg-[var(--background-tertiary)] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-[var(--foreground-muted)] truncate max-w-xs">{campaign.subject}</p>
                      <p className="text-xs text-[var(--foreground-muted)] mt-1">
                        {campaign.sentAt
                          ? "Sent " + formatDate(campaign.sentAt)
                          : campaign.scheduledFor
                            ? "Scheduled for " + formatDate(campaign.scheduledFor)
                            : "Created " + formatDate(campaign.createdAt)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={"text-sm " + type.color}>{type.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={"inline-flex px-2 py-1 rounded-full text-xs font-medium " + status.color + " " + status.bg}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[var(--foreground-muted)]" />
                      <span className="text-sm">{campaign.recipients.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--success)] rounded-full"
                          style={{ width: openRate + "%" }}
                        />
                      </div>
                      <span className="text-sm">{openRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full"
                          style={{ width: clickRate + "%" }}
                        />
                      </div>
                      <span className="text-sm">{clickRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative flex justify-end">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)}
                        className="p-1 hover:bg-[var(--background-elevated)] rounded transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === campaign.id && (
                        <div className="absolute right-0 top-8 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              toast({ title: "View Report", description: "Opening campaign analytics..." });
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                          >
                            <BarChart3 className="w-4 h-4" />
                            View Report
                          </button>
                          <button
                            onClick={() => {
                              toast({ title: "Duplicate", description: "Campaign duplicated as draft" });
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => {
                              toast({ title: "Edit Template", description: "Opening email editor..." });
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            Edit Template
                          </button>
                          <button
                            onClick={() => {
                              toast({
                                title: "Delete Campaign",
                                description: "Campaign deleted",
                                variant: "destructive",
                              });
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" />
            <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
            <p className="text-[var(--foreground-muted)]">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first email campaign to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
