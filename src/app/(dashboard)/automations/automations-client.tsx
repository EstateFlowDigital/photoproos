"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Zap,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Mail,
  MessageSquare,
  Calendar,
  Bell,
  Clock,
  CheckCircle,
  ArrowRight,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: "booking_created" | "gallery_delivered" | "invoice_paid" | "contract_signed" | "time_based";
  actions: string[];
  status: "active" | "paused" | "draft";
  runsCount: number;
  lastRun: string | null;
  createdAt: string;
}

const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Welcome New Client",
    description: "Send welcome email and questionnaire when booking is confirmed",
    trigger: "booking_created",
    actions: ["Send welcome email", "Send questionnaire", "Add to client list"],
    status: "active",
    runsCount: 156,
    lastRun: "2024-01-22T14:30:00Z",
    createdAt: "2023-06-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Gallery Delivery Follow-up",
    description: "Send reminder 3 days after gallery delivery if not viewed",
    trigger: "gallery_delivered",
    actions: ["Wait 3 days", "Check if viewed", "Send reminder email"],
    status: "active",
    runsCount: 89,
    lastRun: "2024-01-21T10:00:00Z",
    createdAt: "2023-08-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Payment Thank You",
    description: "Send thank you email and receipt after invoice payment",
    trigger: "invoice_paid",
    actions: ["Send thank you email", "Send receipt PDF", "Request review"],
    status: "active",
    runsCount: 234,
    lastRun: "2024-01-22T09:15:00Z",
    createdAt: "2023-05-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Contract Signed Workflow",
    description: "Trigger onboarding process when contract is signed",
    trigger: "contract_signed",
    actions: ["Send calendar invite", "Create project folder", "Notify team"],
    status: "paused",
    runsCount: 67,
    lastRun: "2024-01-15T16:00:00Z",
    createdAt: "2023-09-15T00:00:00Z",
  },
  {
    id: "5",
    name: "Session Reminder",
    description: "Send reminder 48 hours before scheduled session",
    trigger: "time_based",
    actions: ["Check upcoming sessions", "Send reminder email", "Send SMS"],
    status: "active",
    runsCount: 312,
    lastRun: "2024-01-22T08:00:00Z",
    createdAt: "2023-04-01T00:00:00Z",
  },
  {
    id: "6",
    name: "Birthday Greeting",
    description: "Send birthday wishes to clients",
    trigger: "time_based",
    actions: ["Check birthdays", "Send birthday email", "Offer discount code"],
    status: "draft",
    runsCount: 0,
    lastRun: null,
    createdAt: "2024-01-20T00:00:00Z",
  },
];

const statusConfig = {
  active: { label: "Active", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  paused: { label: "Paused", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  draft: { label: "Draft", color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-tertiary)]" },
};

const triggerConfig = {
  booking_created: { label: "Booking Created", icon: Calendar, color: "text-[var(--primary)]" },
  gallery_delivered: { label: "Gallery Delivered", icon: CheckCircle, color: "text-[var(--success)]" },
  invoice_paid: { label: "Invoice Paid", icon: Bell, color: "text-[var(--info)]" },
  contract_signed: { label: "Contract Signed", icon: MessageSquare, color: "text-[var(--warning)]" },
  time_based: { label: "Time Based", icon: Clock, color: "text-[var(--ai)]" },
};

export function AutomationsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredAutomations = mockAutomations.filter((automation) => {
    const matchesSearch =
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || automation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockAutomations.length,
    active: mockAutomations.filter((a) => a.status === "active").length,
    totalRuns: mockAutomations.reduce((acc, a) => acc + a.runsCount, 0),
    timeSaved: Math.round(mockAutomations.reduce((acc, a) => acc + a.runsCount, 0) * 5), // 5 min per run
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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
              <Zap className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Automations</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--success)]/10">
              <Play className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Active</p>
              <p className="text-2xl font-semibold">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--info)]/10">
              <CheckCircle className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Runs</p>
              <p className="text-2xl font-semibold">{stats.totalRuns.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--warning)]/10">
              <Clock className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Time Saved</p>
              <p className="text-2xl font-semibold">{Math.round(stats.timeSaved / 60)}h</p>
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
            placeholder="Search automations..."
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
            <option value="draft">Draft</option>
          </select>
          <button
            onClick={() =>
              toast({
                title: "Create Automation",
                description: "Opening automation builder...",
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Automation
          </button>
        </div>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {filteredAutomations.map((automation) => {
          const status = statusConfig[automation.status];
          const trigger = triggerConfig[automation.trigger];
          const TriggerIcon = trigger.icon;

          return (
            <div key={automation.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={"p-3 rounded-lg bg-[var(--background-tertiary)]"}>
                    <Zap className={"w-6 h-6 " + (automation.status === "active" ? "text-[var(--primary)]" : "text-[var(--foreground-muted)]")} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{automation.name}</h3>
                      <span className={"inline-flex px-2 py-0.5 rounded-full text-xs font-medium " + status.color + " " + status.bg}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)] mb-3">{automation.description}</p>
                    
                    {/* Trigger and Actions */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className={"flex items-center gap-1 px-2 py-1 rounded bg-[var(--background-tertiary)] " + trigger.color}>
                        <TriggerIcon className="w-3 h-3" />
                        <span>{trigger.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--foreground-muted)]" />
                      <div className="flex items-center gap-1">
                        {automation.actions.map((action, index) => (
                          <span key={index} className="px-2 py-1 rounded bg-[var(--background-tertiary)] text-xs">
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--foreground-muted)]">
                      <span>{automation.runsCount.toLocaleString()} runs</span>
                      {automation.lastRun && (
                        <span>Last run: {formatDate(automation.lastRun)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === automation.id ? null : automation.id)}
                    className="p-1 hover:bg-[var(--background-elevated)] rounded transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {openMenuId === automation.id && (
                    <div className="absolute right-0 top-8 w-40 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          toast({ title: "Edit", description: "Opening automation editor..." });
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      {automation.status === "active" ? (
                        <button
                          onClick={() => {
                            toast({ title: "Paused", description: "Automation paused" });
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            toast({ title: "Activated", description: "Automation activated" });
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--success)] hover:bg-[var(--success)]/10 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => {
                          toast({ title: "Duplicated", description: "Automation duplicated" });
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          toast({
                            title: "Delete",
                            description: "Automation deleted",
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
              </div>
            </div>
          );
        })}
      </div>

      {filteredAutomations.length === 0 && (
        <div className="card p-12 text-center">
          <Zap className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" />
          <h3 className="text-lg font-medium mb-2">No automations found</h3>
          <p className="text-[var(--foreground-muted)]">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first automation to save time"}
          </p>
        </div>
      )}
    </div>
  );
}
