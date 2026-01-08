"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow, format } from "date-fns";

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ServerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
    </svg>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

interface AuditLog {
  id: string;
  actionType: string;
  description: string;
  targetUserId: string | null;
  targetOrgId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  adminUser?: {
    email: string;
    fullName: string | null;
  };
}

interface SystemHealth {
  totalUsers: number;
  totalOrganizations: number;
  totalGalleries: number;
  recentLogins: number;
  activeImpersonations: number;
  featureFlagsEnabled: number;
  featureFlagsTotal: number;
  recentAuditLogs: number;
}

interface LogsPageClientProps {
  logs: AuditLog[];
  totalLogs: number;
  currentPage: number;
  health: SystemHealth | null;
  filterType?: string;
  filterSearch?: string;
}

const ACTION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  user_impersonate: { label: "Impersonate", color: "bg-[var(--ai)]/10 text-[var(--ai)]" },
  user_award_xp: { label: "Award XP", color: "bg-[var(--success)]/10 text-[var(--success)]" },
  user_grant_license: { label: "Grant License", color: "bg-[var(--primary)]/10 text-[var(--primary)]" },
  user_revoke_license: { label: "Revoke License", color: "bg-[var(--warning)]/10 text-[var(--warning)]" },
  user_apply_discount: { label: "Apply Discount", color: "bg-[var(--success)]/10 text-[var(--success)]" },
  user_create_challenge: { label: "Create Challenge", color: "bg-[var(--primary)]/10 text-[var(--primary)]" },
  feature_flag_toggle: { label: "Toggle Flag", color: "bg-[var(--warning)]/10 text-[var(--warning)]" },
  feature_flag_create: { label: "Create Flag", color: "bg-[var(--success)]/10 text-[var(--success)]" },
  feature_flag_delete: { label: "Delete Flag", color: "bg-[var(--error)]/10 text-[var(--error)]" },
  system_setting_update: { label: "Update Setting", color: "bg-[var(--warning)]/10 text-[var(--warning)]" },
  support_ticket_resolve: { label: "Resolve Ticket", color: "bg-[var(--success)]/10 text-[var(--success)]" },
  support_ticket_respond: { label: "Respond", color: "bg-[var(--primary)]/10 text-[var(--primary)]" },
};

const ACTION_TYPES = [
  { value: "all", label: "All Actions" },
  { value: "user_impersonate", label: "Impersonation" },
  { value: "user_award_xp", label: "XP Awards" },
  { value: "user_grant_license", label: "License Grants" },
  { value: "user_revoke_license", label: "License Revokes" },
  { value: "feature_flag_toggle", label: "Feature Flags" },
  { value: "system_setting_update", label: "System Settings" },
  { value: "support_ticket_resolve", label: "Support Actions" },
];

export function LogsPageClient({
  logs,
  totalLogs,
  currentPage,
  health,
  filterType,
  filterSearch,
}: LogsPageClientProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(filterSearch || "");
  const [selectedType, setSelectedType] = useState(filterType || "all");

  const totalPages = Math.ceil(totalLogs / 50);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (selectedType !== "all") params.set("type", selectedType);
    router.push(`/super-admin/logs?${params.toString()}`);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (value !== "all") params.set("type", value);
    router.push(`/super-admin/logs?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (selectedType !== "all") params.set("type", selectedType);
    params.set("page", page.toString());
    router.push(`/super-admin/logs?${params.toString()}`);
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const healthStats = health
    ? [
        {
          label: "Total Users",
          value: health.totalUsers.toLocaleString(),
          icon: UsersIcon,
          color: "text-[var(--primary)]",
        },
        {
          label: "Organizations",
          value: health.totalOrganizations.toLocaleString(),
          icon: DatabaseIcon,
          color: "text-[var(--success)]",
        },
        {
          label: "Recent Logins (24h)",
          value: health.recentLogins.toLocaleString(),
          icon: ActivityIcon,
          color: "text-[var(--warning)]",
        },
        {
          label: "Active Impersonations",
          value: health.activeImpersonations.toString(),
          icon: AlertIcon,
          color: health.activeImpersonations > 0 ? "text-[var(--error)]" : "text-[var(--foreground-muted)]",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Health Stats */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {healthStats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "p-4 rounded-xl",
                "border border-[var(--border)]",
                "bg-[var(--card)]"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
                <span className="text-sm text-[var(--foreground-muted)]">
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--foreground)]">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* System Status */}
      {health && (
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]",
            "flex items-center justify-between"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ServerIcon className="w-5 h-5 text-[var(--success)]" />
              <span className="font-medium text-[var(--foreground)]">System Status</span>
            </div>
            <Badge className="bg-[var(--success)]/10 text-[var(--success)]">
              Operational
            </Badge>
            <span className="text-sm text-[var(--foreground-muted)]">
              {health.featureFlagsEnabled} of {health.featureFlagsTotal} feature flags enabled
            </span>
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            {health.totalGalleries.toLocaleString()} galleries in system
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>

        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleRefresh}>
          <RefreshIcon className="w-4 h-4 mr-2" />
          Refresh
        </Button>

        <div className="text-sm text-[var(--foreground-muted)] ml-auto">
          {totalLogs.toLocaleString()} total logs
        </div>
      </div>

      {/* Logs Table */}
      <div
        className={cn(
          "rounded-xl overflow-hidden",
          "border border-[var(--border)]",
          "bg-[var(--card)]"
        )}
      >
        {/* Table Header */}
        <div
          className={cn(
            "grid grid-cols-12 gap-4 px-4 py-3",
            "bg-[var(--background-tertiary)]",
            "text-sm font-medium text-[var(--foreground-muted)]",
            "border-b border-[var(--border)]"
          )}
        >
          <div className="col-span-2">Time</div>
          <div className="col-span-2">Action</div>
          <div className="col-span-2">Admin</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Details</div>
        </div>

        {/* Table Body */}
        {logs.length > 0 ? (
          logs.map((log) => {
            const actionInfo = ACTION_TYPE_LABELS[log.actionType] || {
              label: log.actionType,
              color: "bg-[var(--background-tertiary)] text-[var(--foreground-muted)]",
            };

            return (
              <div
                key={log.id}
                className={cn(
                  "grid grid-cols-12 gap-4 px-4 py-3",
                  "border-b border-[var(--border)] last:border-0",
                  "hover:bg-[var(--background-tertiary)]/50",
                  "transition-colors"
                )}
              >
                <div className="col-span-2 text-sm">
                  <div className="text-[var(--foreground)]">
                    {format(new Date(log.createdAt), "MMM d, HH:mm")}
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)]">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </div>
                </div>

                <div className="col-span-2">
                  <Badge className={cn("text-xs", actionInfo.color)}>
                    {actionInfo.label}
                  </Badge>
                </div>

                <div className="col-span-2 text-sm text-[var(--foreground)]">
                  {log.adminUser?.fullName || log.adminUser?.email || "System"}
                </div>

                <div className="col-span-4 text-sm text-[var(--foreground-muted)] truncate">
                  {log.description}
                </div>

                <div className="col-span-2 text-xs text-[var(--foreground-muted)]">
                  {log.targetUserId && (
                    <span className="block truncate">User: {log.targetUserId.slice(0, 8)}...</span>
                  )}
                  {log.targetOrgId && (
                    <span className="block truncate">Org: {log.targetOrgId.slice(0, 8)}...</span>
                  )}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <span className="text-[var(--primary)]">
                      +{Object.keys(log.metadata).length} fields
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-[var(--foreground-muted)]">
            <ActivityIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No logs found</p>
            {(filterType || filterSearch) && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchInput("");
                  setSelectedType("all");
                  router.push("/super-admin/logs");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <span className="text-sm text-[var(--foreground-muted)]">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
