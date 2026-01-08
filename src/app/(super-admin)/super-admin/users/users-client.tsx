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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { awardXp, grantLifetimeLicense } from "@/lib/actions/super-admin";
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

  const totalPages = Math.ceil(total / 20);

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

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
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
      </div>

      {/* Stats */}
      <div className="text-sm text-[var(--foreground-muted)]">
        Showing {users.length} of {total} users
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className={cn(
              "p-4 rounded-xl",
              "border border-[var(--border)]",
              "bg-[var(--card)]",
              "hover:border-[var(--border-hover)]",
              "transition-colors"
            )}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
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
              {user.hasLifetimeLicense && (
                <Badge
                  variant="secondary"
                  className="bg-[var(--success)]/10 text-[var(--success)]"
                >
                  Lifetime
                </Badge>
              )}
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

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleAwardXp(user)}
              >
                <StarIcon className="w-4 h-4 mr-1" />
                XP
              </Button>
              {!user.hasLifetimeLicense && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleGrantLicense(user)}
                  disabled={isPending}
                >
                  <GiftIcon className="w-4 h-4 mr-1" />
                  License
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/super-admin/users/${user.id}`}>View</Link>
              </Button>
            </div>
          </div>
        ))}
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
