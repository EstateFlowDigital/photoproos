"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Megaphone,
  DollarSign,
  Eye,
  MousePointer,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  Edit,
  Trash2,
  BarChart3,
  Target,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdCampaign {
  id: string;
  name: string;
  platform: "facebook" | "instagram" | "google" | "tiktok";
  status: "active" | "paused" | "ended" | "draft";
  objective: "awareness" | "traffic" | "leads" | "conversions";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  startDate: string;
  endDate: string | null;
}

const mockCampaigns: AdCampaign[] = [
  {
    id: "1",
    name: "Spring Portraits 2024",
    platform: "facebook",
    status: "active",
    objective: "leads",
    budget: 500,
    spent: 342.50,
    impressions: 45600,
    clicks: 892,
    conversions: 24,
    ctr: 1.96,
    cpc: 0.38,
    startDate: "2024-01-15T00:00:00Z",
    endDate: "2024-02-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Wedding Season Promo",
    platform: "instagram",
    status: "active",
    objective: "conversions",
    budget: 750,
    spent: 456.80,
    impressions: 62400,
    clicks: 1240,
    conversions: 18,
    ctr: 1.99,
    cpc: 0.37,
    startDate: "2024-01-10T00:00:00Z",
    endDate: "2024-03-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Brand Awareness - Local",
    platform: "google",
    status: "paused",
    objective: "awareness",
    budget: 300,
    spent: 189.20,
    impressions: 32100,
    clicks: 456,
    conversions: 8,
    ctr: 1.42,
    cpc: 0.41,
    startDate: "2024-01-01T00:00:00Z",
    endDate: null,
  },
  {
    id: "4",
    name: "Holiday Mini Sessions",
    platform: "facebook",
    status: "ended",
    objective: "leads",
    budget: 400,
    spent: 400,
    impressions: 52300,
    clicks: 1105,
    conversions: 42,
    ctr: 2.11,
    cpc: 0.36,
    startDate: "2023-11-15T00:00:00Z",
    endDate: "2023-12-20T00:00:00Z",
  },
  {
    id: "5",
    name: "TikTok Test Campaign",
    platform: "tiktok",
    status: "draft",
    objective: "traffic",
    budget: 200,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    cpc: 0,
    startDate: "2024-02-01T00:00:00Z",
    endDate: null,
  },
];

const statusConfig = {
  active: { label: "Active", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  paused: { label: "Paused", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  ended: { label: "Ended", color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-tertiary)]" },
  draft: { label: "Draft", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
};

const platformConfig = {
  facebook: { label: "Facebook", color: "text-blue-500", bg: "bg-blue-500/10" },
  instagram: { label: "Instagram", color: "text-pink-500", bg: "bg-pink-500/10" },
  google: { label: "Google", color: "text-green-500", bg: "bg-green-500/10" },
  tiktok: { label: "TikTok", color: "text-purple-500", bg: "bg-purple-500/10" },
};

export function AdsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalSpent: mockCampaigns.reduce((acc, c) => acc + c.spent, 0),
    totalConversions: mockCampaigns.reduce((acc, c) => acc + c.conversions, 0),
    avgCtr: mockCampaigns.filter(c => c.ctr > 0).reduce((acc, c) => acc + c.ctr, 0) / mockCampaigns.filter(c => c.ctr > 0).length || 0,
    activeCampaigns: mockCampaigns.filter((c) => c.status === "active").length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <DollarSign className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Spent</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.totalSpent)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--success)]/10">
              <Target className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Conversions</p>
              <p className="text-2xl font-semibold">{stats.totalConversions}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--info)]/10">
              <MousePointer className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Avg CTR</p>
              <p className="text-2xl font-semibold">{stats.avgCtr.toFixed(2)}%</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--warning)]/10">
              <Megaphone className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Active Campaigns</p>
              <p className="text-2xl font-semibold">{stats.activeCampaigns}</p>
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
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="ended">Ended</option>
            <option value="draft">Draft</option>
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
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Platform</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Budget/Spent</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Results</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Performance</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredCampaigns.map((campaign) => {
              const status = statusConfig[campaign.status];
              const platform = platformConfig[campaign.platform];
              const budgetUsed = (campaign.spent / campaign.budget) * 100;

              return (
                <tr key={campaign.id} className="hover:bg-[var(--background-tertiary)] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {formatDate(campaign.startDate)} - {campaign.endDate ? formatDate(campaign.endDate) : "Ongoing"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={"inline-flex px-2 py-1 rounded-full text-xs font-medium " + platform.color + " " + platform.bg}>
                      {platform.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={"inline-flex px-2 py-1 rounded-full text-xs font-medium " + status.color + " " + status.bg}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <p className="text-sm font-medium">{formatCurrency(campaign.spent)}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">of {formatCurrency(campaign.budget)}</p>
                      <div className="w-20 h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden mt-1 ml-auto">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full"
                          style={{ width: Math.min(budgetUsed, 100) + "%" }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <p className="text-sm font-medium">{campaign.conversions} conversions</p>
                      <p className="text-xs text-[var(--foreground-muted)]">{campaign.clicks.toLocaleString()} clicks</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <p className="text-sm font-medium">{campaign.ctr}% CTR</p>
                      <p className="text-xs text-[var(--foreground-muted)]">{formatCurrency(campaign.cpc)} CPC</p>
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
                        <div className="absolute right-0 top-8 w-40 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              toast({ title: "Analytics", description: "Opening detailed analytics..." });
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                          >
                            <BarChart3 className="w-4 h-4" />
                            View Analytics
                          </button>
                          {campaign.status === "active" && (
                            <button
                              onClick={() => {
                                toast({ title: "Paused", description: "Campaign paused" });
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                            >
                              <Pause className="w-4 h-4" />
                              Pause
                            </button>
                          )}
                          {campaign.status === "paused" && (
                            <button
                              onClick={() => {
                                toast({ title: "Resumed", description: "Campaign resumed" });
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                            >
                              <Play className="w-4 h-4" />
                              Resume
                            </button>
                          )}
                          <button
                            onClick={() => {
                              toast({ title: "Edit", description: "Opening campaign editor..." });
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              toast({
                                title: "Delete",
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
            <Megaphone className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" />
            <h3 className="text-lg font-medium mb-2">No ad campaigns found</h3>
            <p className="text-[var(--foreground-muted)]">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first ad campaign to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
