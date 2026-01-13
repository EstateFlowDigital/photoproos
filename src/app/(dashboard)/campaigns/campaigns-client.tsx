"use client";

import { useState } from "react";
import {
  Megaphone,
  Mail,
  Users,
  TrendingUp,
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Trash2,
  Edit2,
  Eye,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type CampaignType = "email" | "sms" | "social";
type CampaignStatus = "draft" | "scheduled" | "active" | "completed" | "paused";

interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  subject: string;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Spring Mini Sessions",
    type: "email",
    status: "completed",
    subject: "Book Your Spring Mini Session - Limited Spots!",
    recipients: 450,
    sent: 450,
    opened: 312,
    clicked: 89,
    scheduledAt: null,
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Gallery Ready Notification",
    type: "email",
    status: "active",
    subject: "Your Photos Are Ready to View!",
    recipients: 25,
    sent: 25,
    opened: 22,
    clicked: 18,
    scheduledAt: null,
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Holiday Card Reminder",
    type: "email",
    status: "scheduled",
    subject: "Don't Miss Out on Holiday Card Ordering!",
    recipients: 380,
    sent: 0,
    opened: 0,
    clicked: 0,
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Re-engagement Campaign",
    type: "email",
    status: "draft",
    subject: "We Miss You! Here's 15% Off Your Next Session",
    recipients: 125,
    sent: 0,
    opened: 0,
    clicked: 0,
    scheduledAt: null,
    sentAt: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    name: "Referral Thank You",
    type: "email",
    status: "paused",
    subject: "Thank You for Your Referral!",
    recipients: 50,
    sent: 30,
    opened: 25,
    clicked: 12,
    scheduledAt: null,
    sentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
  scheduled: { label: "Scheduled", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  active: { label: "Active", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  completed: { label: "Completed", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  paused: { label: "Paused", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
};

const TYPE_CONFIG: Record<CampaignType, { label: string; color: string }> = {
  email: { label: "Email", color: "text-[var(--primary)]" },
  sms: { label: "SMS", color: "text-[var(--success)]" },
  social: { label: "Social", color: "text-[var(--secondary)]" },
};

export function CampaignsClient() {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(search.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDuplicate = (campaignId: string) => {
    const original = campaigns.find((c) => c.id === campaignId);
    if (original) {
      const duplicate: Campaign = {
        ...original,
        id: Date.now().toString(),
        name: `${original.name} (Copy)`,
        status: "draft",
        sent: 0,
        opened: 0,
        clicked: 0,
        scheduledAt: null,
        sentAt: null,
        createdAt: new Date().toISOString(),
      };
      setCampaigns((prev) => [duplicate, ...prev]);
      showToast("Campaign duplicated", "success");
    }
    setOpenMenuId(null);
  };

  const handlePauseResume = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? { ...c, status: c.status === "paused" ? "active" : "paused" }
          : c
      )
    );
    showToast("Campaign updated", "success");
    setOpenMenuId(null);
  };

  const handleDelete = (campaignId: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    showToast("Campaign deleted", "success");
    setOpenMenuId(null);
  };

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === "active" || c.status === "scheduled").length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
    avgOpenRate:
      campaigns.filter((c) => c.sent > 0).length > 0
        ? Math.round(
            (campaigns.reduce((sum, c) => sum + (c.sent > 0 ? c.opened / c.sent : 0), 0) /
              campaigns.filter((c) => c.sent > 0).length) *
              100
          )
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Campaigns</p>
            <Megaphone className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalCampaigns}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Active Campaigns</p>
            <TrendingUp className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{stats.activeCampaigns}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Emails Sent</p>
            <Mail className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{stats.totalSent.toLocaleString()}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Avg Open Rate</p>
            <BarChart3 className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{stats.avgOpenRate}%</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Create Campaign
        </Button>
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <div className="card p-12 text-center">
          <Megaphone className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No campaigns found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first campaign to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => {
            const statusConfig = STATUS_CONFIG[campaign.status];
            const typeConfig = TYPE_CONFIG[campaign.type];
            const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
            const clickRate = campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100) : 0;

            return (
              <div key={campaign.id} className="card p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-medium text-foreground">{campaign.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className={`text-xs font-medium ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground-muted truncate">{campaign.subject}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {campaign.recipients.toLocaleString()} recipients
                      </span>
                      {campaign.sentAt && (
                        <span>Sent {formatDate(campaign.sentAt)}</span>
                      )}
                      {campaign.scheduledAt && (
                        <span>Scheduled for {formatDate(campaign.scheduledAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {campaign.sent > 0 && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-foreground">{openRate}%</p>
                          <p className="text-xs text-foreground-muted">Open rate</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-foreground">{clickRate}%</p>
                          <p className="text-xs text-foreground-muted">Click rate</p>
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === campaign.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                          {(campaign.status === "active" || campaign.status === "paused") && (
                            <button
                              onClick={() => handlePauseResume(campaign.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                            >
                              {campaign.status === "paused" ? (
                                <>
                                  <Play className="h-4 w-4" />
                                  Resume
                                </>
                              ) : (
                                <>
                                  <Pause className="h-4 w-4" />
                                  Pause
                                </>
                              )}
                            </button>
                          )}
                          {campaign.status === "draft" && (
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDuplicate(campaign.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                          >
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
