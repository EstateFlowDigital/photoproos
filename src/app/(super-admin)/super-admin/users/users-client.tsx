"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { awardXp, grantLifetimeLicense, startImpersonation } from "@/lib/actions/super-admin";
import { formatDistanceToNow } from "date-fns";

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

function FlameIcon({ className }: { className?: string }) {
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
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
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
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
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

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function MoreVerticalIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
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
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
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
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface UserListItem {
  id: string;
  clerkUserId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  hasLifetimeLicense: boolean;
  totalSessions: number;
  organization: {
    id: string;
    name: string;
    plan: string | null;
    hasLifetimeLicense: boolean;
  } | null;
  gamification: {
    totalXp: number;
    level: number;
    currentLoginStreak: number;
  } | null;
  stats: {
    totalGalleries: number;
    totalClients: number;
    totalRevenueCents: number;
  };
}

interface UsersPageClientProps {
  users: UserListItem[];
  total: number;
  currentPage: number;
  search?: string;
}

type FilterPlan = "all" | "free" | "starter" | "pro" | "enterprise";
type FilterActivity = "all" | "active" | "inactive" | "new";
type FilterRevenue = "all" | "none" | "low" | "medium" | "high";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function UsersPageClient({
  users,
  total,
  currentPage,
  search,
}: UsersPageClientProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(search || "");
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [xpAmount, setXpAmount] = useState("");
  const [xpReason, setXpReason] = useState("");
  const [isXpDialogOpen, setIsXpDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Filter states
  const [filterPlan, setFilterPlan] = useState<FilterPlan>("all");
  const [filterActivity, setFilterActivity] = useState<FilterActivity>("all");
  const [filterRevenue, setFilterRevenue] = useState<FilterRevenue>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Bulk selection
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

  const totalPages = Math.ceil(total / 20);

  // Filter users client-side
  const filteredUsers = users.filter((user) => {
    // Plan filter
    if (filterPlan !== "all") {
      const userPlan = (user.organization?.plan || "free").toLowerCase();
      if (userPlan !== filterPlan) return false;
    }

    // Activity filter
    if (filterActivity !== "all") {
      const streak = user.gamification?.currentLoginStreak || 0;
      if (filterActivity === "active" && streak < 3) return false;
      if (filterActivity === "inactive" && streak >= 1) return false;
      if (filterActivity === "new" && user.totalSessions > 5) return false;
    }

    // Revenue filter
    if (filterRevenue !== "all") {
      const revenue = user.stats.totalRevenueCents;
      if (filterRevenue === "none" && revenue > 0) return false;
      if (filterRevenue === "low" && (revenue <= 0 || revenue > 100000)) return false;
      if (filterRevenue === "medium" && (revenue <= 100000 || revenue > 500000)) return false;
      if (filterRevenue === "high" && revenue <= 500000) return false;
    }

    return true;
  });

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Select all visible users
  const selectAllUsers = () => {
    const allIds = new Set(filteredUsers.map((u) => u.id));
    setSelectedUsers(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedUsers(new Set());
    setIsBulkMode(false);
  };

  // Active filter count
  const activeFilterCount = [
    filterPlan !== "all",
    filterActivity !== "all",
    filterRevenue !== "all",
  ].filter(Boolean).length;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    router.push(`/super-admin/users?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", page.toString());
    router.push(`/super-admin/users?${params.toString()}`);
  };

  const handleAwardXp = (user: UserListItem) => {
    setSelectedUser(user);
    setXpAmount("");
    setXpReason("");
    setIsXpDialogOpen(true);
  };

  const submitXpAward = () => {
    if (!selectedUser || !xpAmount) return;

    const amount = parseInt(xpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a positive number",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await awardXp(selectedUser.id, amount, xpReason || undefined);
      if (result.success) {
        toast({
          title: "XP Awarded",
          description: `${amount} XP awarded to ${selectedUser.fullName || selectedUser.email}`,
        });
        setIsXpDialogOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to award XP",
          variant: "destructive",
        });
      }
    });
  };

  const handleGrantLicense = (user: UserListItem) => {
    startTransition(async () => {
      const result = await grantLifetimeLicense(user.id);
      if (result.success) {
        toast({
          title: "License Granted",
          description: `Lifetime license granted to ${user.fullName || user.email}`,
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to grant license",
          variant: "destructive",
        });
      }
    });
  };

  const handleImpersonate = (user: UserListItem) => {
    startTransition(async () => {
      const result = await startImpersonation(user.id, "Quick action from user list");
      if (result.success && result.data) {
        toast({
          title: "Impersonation Started",
          description: `Now viewing as ${user.fullName || user.email}`,
        });
        // Redirect to dashboard to view as user
        window.location.href = "/";
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to start impersonation",
          variant: "destructive",
        });
      }
    });
  };

  // Bulk award XP
  const handleBulkAwardXp = () => {
    if (selectedUsers.size === 0) return;
    const firstUser = filteredUsers.find((u) => selectedUsers.has(u.id));
    if (firstUser) {
      setSelectedUser(firstUser);
      setIsXpDialogOpen(true);
    }
  };

  // Export users to CSV
  const handleExportUsers = () => {
    const headers = ["Name", "Email", "Organization", "Plan", "Level", "XP", "Revenue", "Galleries", "Clients"];
    const rows = filteredUsers.map((u) => [
      u.fullName || "",
      u.email,
      u.organization?.name || "",
      u.organization?.plan || "Free",
      u.gamification?.level || 1,
      u.gamification?.totalXp || 0,
      (u.stats.totalRevenueCents / 100).toFixed(2),
      u.stats.totalGalleries,
      u.stats.totalClients,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredUsers.length} users to CSV`,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterPlan("all");
    setFilterActivity("all");
    setFilterRevenue("all");
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(activeFilterCount > 0 && "border-[var(--primary)]")}
        >
          <FilterIcon className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-[var(--primary)] text-white">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Bulk Mode Toggle */}
        <Button
          variant={isBulkMode ? "default" : "outline"}
          onClick={() => {
            setIsBulkMode(!isBulkMode);
            if (isBulkMode) clearSelection();
          }}
        >
          <CheckIcon className="w-4 h-4 mr-2" />
          Select
        </Button>

        {/* Export */}
        <Button variant="outline" onClick={handleExportUsers}>
          <DownloadIcon className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]",
            "grid grid-cols-1 md:grid-cols-3 gap-4"
          )}
        >
          {/* Plan Filter */}
          <div className="space-y-2">
            <Label className="text-sm text-[var(--foreground-muted)]">Plan</Label>
            <div className="flex flex-wrap gap-2">
              {(["all", "free", "starter", "pro", "enterprise"] as FilterPlan[]).map((plan) => (
                <Button
                  key={plan}
                  variant={filterPlan === plan ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPlan(plan)}
                  className="capitalize"
                >
                  {plan}
                </Button>
              ))}
            </div>
          </div>

          {/* Activity Filter */}
          <div className="space-y-2">
            <Label className="text-sm text-[var(--foreground-muted)]">Activity</Label>
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "inactive", "new"] as FilterActivity[]).map((activity) => (
                <Button
                  key={activity}
                  variant={filterActivity === activity ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActivity(activity)}
                  className="capitalize"
                >
                  {activity}
                </Button>
              ))}
            </div>
          </div>

          {/* Revenue Filter */}
          <div className="space-y-2">
            <Label className="text-sm text-[var(--foreground-muted)]">Revenue</Label>
            <div className="flex flex-wrap gap-2">
              {(["all", "none", "low", "medium", "high"] as FilterRevenue[]).map((rev) => (
                <Button
                  key={rev}
                  variant={filterRevenue === rev ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRevenue(rev)}
                  className="capitalize"
                >
                  {rev === "none" ? "$0" : rev === "low" ? "<$1k" : rev === "medium" ? "$1k-$5k" : rev === "high" ? ">$5k" : rev}
                </Button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div className="md:col-span-3 pt-2 border-t border-[var(--border)]">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {isBulkMode && (
        <div
          className={cn(
            "flex items-center gap-4 p-3 rounded-lg",
            "bg-[var(--primary)]/10 border border-[var(--primary)]/20"
          )}
        >
          <span className="text-sm font-medium">
            {selectedUsers.size} selected
          </span>
          <Button variant="outline" size="sm" onClick={selectAllUsers}>
            Select All ({filteredUsers.length})
          </Button>
          {selectedUsers.size > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleBulkAwardXp}>
                <StarIcon className="w-4 h-4 mr-1" />
                Award XP
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="text-sm text-[var(--foreground-muted)]">
        Showing {filteredUsers.length} of {total} users
        {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active)`}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={cn(
              "p-4 rounded-xl relative",
              "border border-[var(--border)]",
              "bg-[var(--card)]",
              "hover:border-[var(--border-hover)]",
              "transition-colors",
              isBulkMode && selectedUsers.has(user.id) && "border-[var(--primary)] bg-[var(--primary)]/5"
            )}
          >
            {/* Bulk Selection Checkbox */}
            {isBulkMode && (
              <button
                onClick={() => toggleUserSelection(user.id)}
                className={cn(
                  "absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center",
                  "transition-colors",
                  selectedUsers.has(user.id)
                    ? "bg-[var(--primary)] border-[var(--primary)]"
                    : "border-[var(--border)] hover:border-[var(--primary)]"
                )}
              >
                {selectedUsers.has(user.id) && (
                  <CheckIcon className="w-3 h-3 text-white" />
                )}
              </button>
            )}

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.fullName || user.email}'s avatar`}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div
                  className={cn(
                    "w-10 h-10 rounded-full",
                    "bg-[var(--primary)]/10",
                    "flex items-center justify-center",
                    "text-[var(--primary)] font-semibold"
                  )}
                >
                  {(user.fullName || user.email)[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[var(--foreground)] truncate">
                  {user.organization?.name || "No Organization"}
                </div>
                <div className="text-sm text-[var(--foreground-muted)] truncate">
                  {user.fullName || user.email}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {user.hasLifetimeLicense && (
                  <Badge
                    variant="secondary"
                    className="bg-[var(--success)]/10 text-[var(--success)]"
                  >
                    Lifetime
                  </Badge>
                )}
                {/* Actions Dropdown */}
                {!isBulkMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAwardXp(user)}>
                        <StarIcon className="w-4 h-4 mr-2" />
                        Award XP
                      </DropdownMenuItem>
                      {!user.hasLifetimeLicense && (
                        <DropdownMenuItem onClick={() => handleGrantLicense(user)}>
                          <GiftIcon className="w-4 h-4 mr-2" />
                          Grant License
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleImpersonate(user)}>
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Impersonate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/super-admin/users/${user.id}`}>
                          <UserPlusIcon className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Plan Badge */}
            <div className="mb-3">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  (user.organization?.plan || "").toLowerCase() === "pro" &&
                    "bg-[var(--primary)]/10 text-[var(--primary)]",
                  (user.organization?.plan || "").toLowerCase() === "enterprise" &&
                    "bg-[var(--ai)]/10 text-[var(--ai)]"
                )}
              >
                {user.organization?.plan || "Free"}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                <span>Level:</span>
                <span className="font-medium text-[var(--foreground)]">
                  {user.gamification?.level || 1}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                <span>XP:</span>
                <span className="font-medium text-[var(--foreground)]">
                  {(user.gamification?.totalXp || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                <FlameIcon className="w-4 h-4 text-[var(--warning)]" />
                <span className="font-medium text-[var(--foreground)]">
                  {user.gamification?.currentLoginStreak || 0}d
                </span>
              </div>
              <div className="text-[var(--foreground-muted)]">
                {formatCurrency(user.stats.totalRevenueCents)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-[var(--foreground-muted)]">
              <div>Galleries: {user.stats.totalGalleries}</div>
              <div>Clients: {user.stats.totalClients}</div>
            </div>

            {/* Quick Actions */}
            {!isBulkMode && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleImpersonate(user)}
                  disabled={isPending}
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View As
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/super-admin/users/${user.id}`}>
                    Details
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div
          className={cn(
            "text-center py-12",
            "bg-[var(--card)] rounded-xl",
            "border border-[var(--border)]"
          )}
        >
          <UserPlusIcon className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-muted)]" />
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
            No users found
          </h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            {activeFilterCount > 0
              ? "Try adjusting your filters to see more results"
              : "No users match your search criteria"}
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      )}

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

      {/* XP Award Dialog */}
      <Dialog open={isXpDialogOpen} onOpenChange={setIsXpDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Award XP</DialogTitle>
            <DialogDescription>
              Award experience points to{" "}
              {selectedUser?.fullName || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">XP Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={xpAmount}
                onChange={(e) => setXpAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="e.g., Beta tester reward"
                value={xpReason}
                onChange={(e) => setXpReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsXpDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={submitXpAward} disabled={isPending}>
                {isPending ? (
                  <LoaderIcon className="w-4 h-4 mr-2" />
                ) : (
                  <StarIcon className="w-4 h-4 mr-2" />
                )}
                Award XP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
