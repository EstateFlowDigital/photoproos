"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Play,
  Pause,
  MoreHorizontal,
  Copy,
  Edit2,
  Trash2,
  Mail,
  Bell,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type WorkflowTrigger = "booking_confirmed" | "payment_received" | "contract_signed" | "gallery_delivered" | "invoice_sent";
type WorkflowStatus = "active" | "paused" | "draft";

interface WorkflowAction {
  type: "email" | "notification" | "task" | "delay";
  description: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  status: WorkflowStatus;
  runsCount: number;
  lastRun: string | null;
  createdAt: string;
}

// Mock data
const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: "1",
    name: "New Booking Welcome",
    description: "Send welcome email and create task when booking is confirmed",
    trigger: "booking_confirmed",
    actions: [
      { type: "email", description: "Send welcome email" },
      { type: "task", description: "Create 'Prepare for shoot' task" },
      { type: "notification", description: "Notify team member" },
    ],
    status: "active",
    runsCount: 45,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Payment Thank You",
    description: "Send thank you email after payment is received",
    trigger: "payment_received",
    actions: [
      { type: "email", description: "Send thank you email" },
    ],
    status: "active",
    runsCount: 89,
    lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Contract Signed Follow-up",
    description: "Send confirmation and create project after contract is signed",
    trigger: "contract_signed",
    actions: [
      { type: "email", description: "Send contract confirmation" },
      { type: "task", description: "Create project folder" },
      { type: "delay", description: "Wait 1 day" },
      { type: "email", description: "Send questionnaire" },
    ],
    status: "active",
    runsCount: 32,
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Gallery Delivery Notification",
    description: "Notify client and request review when gallery is delivered",
    trigger: "gallery_delivered",
    actions: [
      { type: "email", description: "Send gallery delivery email" },
      { type: "delay", description: "Wait 3 days" },
      { type: "email", description: "Request review" },
    ],
    status: "paused",
    runsCount: 56,
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    name: "Invoice Reminder Sequence",
    description: "Send payment reminders after invoice is sent",
    trigger: "invoice_sent",
    actions: [
      { type: "delay", description: "Wait 7 days" },
      { type: "email", description: "Send first reminder" },
      { type: "delay", description: "Wait 7 days" },
      { type: "email", description: "Send second reminder" },
    ],
    status: "draft",
    runsCount: 0,
    lastRun: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const TRIGGER_CONFIG: Record<WorkflowTrigger, { label: string; icon: React.ElementType; color: string }> = {
  booking_confirmed: { label: "Booking Confirmed", icon: Calendar, color: "text-[var(--primary)]" },
  payment_received: { label: "Payment Received", icon: DollarSign, color: "text-[var(--success)]" },
  contract_signed: { label: "Contract Signed", icon: FileText, color: "text-[var(--warning)]" },
  gallery_delivered: { label: "Gallery Delivered", icon: CheckCircle2, color: "text-[var(--info)]" },
  invoice_sent: { label: "Invoice Sent", icon: Mail, color: "text-[var(--secondary)]" },
};

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  paused: { label: "Paused", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  draft: { label: "Draft", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  email: Mail,
  notification: Bell,
  task: CheckCircle2,
  delay: Clock,
};

export function WorkflowsClient() {
  const { showToast } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
        setFocusedIndex(-1);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenuId(null);
        setFocusedIndex(-1);
      }
    };
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [openMenuId]);

  // Focus management for dropdown menu items
  useEffect(() => {
    if (openMenuId && dropdownRef.current && focusedIndex >= 0) {
      const items = dropdownRef.current.querySelectorAll('[role="menuitem"]');
      (items[focusedIndex] as HTMLElement)?.focus();
    }
  }, [focusedIndex, openMenuId]);

  const handleDropdownKeyNav = useCallback((e: React.KeyboardEvent, itemCount: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % itemCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + itemCount) % itemCount);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusedIndex(itemCount - 1);
    }
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(search.toLowerCase()) ||
    workflow.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === workflowId) {
          const newStatus = w.status === "active" ? "paused" : "active";
          showToast(`Workflow ${newStatus === "active" ? "activated" : "paused"}`, "success");
          return { ...w, status: newStatus };
        }
        return w;
      })
    );
  };

  const handleDelete = (workflowId: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    showToast("Workflow deleted", "success");
    setOpenMenuId(null);
  };

  const stats = {
    total: workflows.length,
    active: workflows.filter((w) => w.status === "active").length,
    paused: workflows.filter((w) => w.status === "paused").length,
    totalRuns: workflows.reduce((sum, w) => sum + w.runsCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Workflows</p>
            <Zap className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Active</p>
            <Play className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{stats.active}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Paused</p>
            <Pause className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{stats.paused}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Runs</p>
            <Zap className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalRuns}</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" aria-hidden="true" />
          <label htmlFor="workflow-search" className="sr-only">Search workflows</label>
          <input
            id="workflow-search"
            type="search"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
        <Link href="/workflows/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Create Workflow
          </Button>
        </Link>
      </div>

      {/* Workflows List */}
      {filteredWorkflows.length === 0 ? (
        <div className="card p-12 text-center">
          <Zap className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No workflows found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search ? "Try adjusting your search" : "Create your first workflow to automate tasks"}
          </p>
          {!search && (
            <Link href="/workflows/new">
              <Button className="mt-6">
                <Plus className="h-4 w-4 mr-1" />
                Create Workflow
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkflows.map((workflow) => {
            const triggerConfig = TRIGGER_CONFIG[workflow.trigger] ?? { label: "Unknown", icon: Zap, color: "text-foreground-muted" };
            const statusConfig = STATUS_CONFIG[workflow.status] ?? { label: "Unknown", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" };
            const TriggerIcon = triggerConfig.icon;

            return (
              <div key={workflow.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground">{workflow.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-foreground-muted mt-1">{workflow.description}</p>

                    {/* Trigger and Actions Flow */}
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <div className={`flex items-center gap-1.5 rounded-full border border-[var(--card-border)] px-2.5 py-1 text-xs`}>
                        <TriggerIcon className={`h-3 w-3 ${triggerConfig.color}`} />
                        <span className="text-foreground">{triggerConfig.label}</span>
                      </div>
                      {workflow.actions.map((action, idx) => {
                        const ActionIcon = ACTION_ICONS[action.type];
                        return (
                          <div key={idx} className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 text-foreground-muted" />
                            <div className="flex items-center gap-1.5 rounded-full bg-[var(--background-tertiary)] px-2.5 py-1 text-xs">
                              <ActionIcon className="h-3 w-3 text-foreground-muted" />
                              <span className="text-foreground-muted">{action.description}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stats */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-foreground-muted">
                      <span>{workflow.runsCount} runs</span>
                      {workflow.lastRun && (
                        <span>Last run {formatRelativeTime(workflow.lastRun)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {workflow.status !== "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(workflow.id)}
                      >
                        {workflow.status === "active" ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    )}
                    <div className="relative" ref={openMenuId === workflow.id ? dropdownRef : undefined}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setOpenMenuId(openMenuId === workflow.id ? null : workflow.id);
                          setFocusedIndex(-1);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpenMenuId(openMenuId === workflow.id ? null : workflow.id);
                            setFocusedIndex(0);
                          } else if (e.key === "ArrowDown" && openMenuId !== workflow.id) {
                            e.preventDefault();
                            setOpenMenuId(workflow.id);
                            setFocusedIndex(0);
                          }
                        }}
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === workflow.id}
                        aria-label={`Actions for ${workflow.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === workflow.id && (
                        <div
                          role="menu"
                          aria-label="Workflow actions"
                          className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg"
                          onKeyDown={(e) => handleDropdownKeyNav(e, 3)}
                        >
                          <Link
                            href={`/workflows/${workflow.id}`}
                            role="menuitem"
                            tabIndex={focusedIndex === 0 ? 0 : -1}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)] focus:outline-none focus-visible:bg-[var(--background-hover)]"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Link>
                          <button
                            role="menuitem"
                            tabIndex={focusedIndex === 1 ? 0 : -1}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)] focus:outline-none focus-visible:bg-[var(--background-hover)]"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </button>
                          <button
                            role="menuitem"
                            tabIndex={focusedIndex === 2 ? 0 : -1}
                            onClick={() => handleDelete(workflow.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleDelete(workflow.id);
                              }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)] focus:outline-none focus-visible:bg-[var(--background-hover)]"
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
