"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InviteModal, PendingInvitations } from "./invite-modal";
import { ArrowLeftIcon, PlusIcon, CheckIcon, XIcon, UsersIcon, ShieldIcon, UserIcon, TrashIcon } from "@/components/ui/settings-icons";
import { updateMemberRole, removeMember } from "@/lib/actions/settings";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  userId: string;
  role: "owner" | "admin" | "member";
  createdAt: Date;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    createdAt: Date;
  };
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
}

interface TeamPageClientProps {
  members: TeamMember[];
  pendingInvitations: PendingInvitation[];
  memberLimit: number;
}

const roleLabels = {
  owner: { label: "Owner", color: "bg-purple-500/10 text-purple-400" },
  admin: { label: "Admin", color: "bg-blue-500/10 text-blue-400" },
  member: { label: "Member", color: "bg-gray-500/10 text-gray-400" },
};

export function TeamPageClient({ members, pendingInvitations, memberLimit }: TeamPageClientProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const inviteHandledRef = useRef(false);

  const canInvite = memberLimit === -1 || members.length < memberLimit;
  const inviteParam = searchParams?.get("invite");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  const handleRoleChange = (memberId: string, newRole: "admin" | "member") => {
    startTransition(async () => {
      const result = await updateMemberRole(memberId, newRole);
      if (result.success) {
        toast.success(`Role updated to ${newRole}`);
      } else {
        toast.error(result.error || "Failed to update role");
      }
      setOpenDropdown(null);
    });
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }
    startTransition(async () => {
      const result = await removeMember(memberId);
      if (result.success) {
        toast.success("Team member removed");
      } else {
        toast.error(result.error || "Failed to remove member");
      }
      setOpenDropdown(null);
    });
  };

  useEffect(() => {
    if (inviteHandledRef.current || !inviteParam) {
      return;
    }

    if (["1", "true", "yes"].includes(inviteParam.toLowerCase())) {
      setIsInviteModalOpen(true);
    }

    inviteHandledRef.current = true;
  }, [inviteParam]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team Members</h1>
          <p className="text-sm text-foreground-muted mt-1">Manage your team and permissions</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button variant="primary" onClick={() => setIsInviteModalOpen(true)} disabled={!canInvite}>
            <PlusIcon className="h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Team Limit */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-foreground-muted">Team Members</p>
            <p className="text-lg font-semibold text-foreground">
              {members.length} / {memberLimit === -1 ? "∞" : memberLimit} seats used
            </p>
          </div>
          {memberLimit !== -1 && (
            <div className="w-full sm:w-32">
              <div className="h-2 rounded-full bg-[var(--background-secondary)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${Math.min((members.length / memberLimit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <PendingInvitations invitations={pendingInvitations} />
        </div>
      )}

      {/* Active Members */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Members</h2>
        {members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => {
              const roleInfo = roleLabels[member.role as keyof typeof roleLabels] || roleLabels.member;
              return (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
                      {(member.user.fullName || member.user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{member.user.fullName || member.user.email}</p>
                      <p className="text-sm text-foreground-muted">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", roleInfo.color)}>
                      {roleInfo.label}
                    </span>
                    <p className="text-sm text-foreground-muted">
                      Joined {new Date(member.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                    <Link
                      href={`/settings/team/${member.userId}/capabilities`}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/10 transition-colors hover:bg-[var(--primary)]/20"
                    >
                      Skills & Equipment
                    </Link>
                    {member.role !== "owner" && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === member.id ? null : member.id);
                          }}
                          className="rounded-lg bg-[var(--background-hover)] p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground"
                          disabled={isPending}
                        >
                          <MoreIcon className="h-4 w-4" />
                        </button>
                        {openDropdown === member.id && (
                          <div
                            className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-2 text-xs font-medium text-foreground-muted">
                              Change Role
                            </div>
                            {member.role !== "admin" && (
                              <button
                                onClick={() => handleRoleChange(member.id, "admin")}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                              >
                                <ShieldIcon className="h-4 w-4 text-blue-400" />
                                Make Admin
                              </button>
                            )}
                            {member.role !== "member" && (
                              <button
                                onClick={() => handleRoleChange(member.id, "member")}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                              >
                                <UserIcon className="h-4 w-4 text-gray-400" />
                                Make Member
                              </button>
                            )}
                            <div className="my-1 border-t border-[var(--card-border)]" />
                            <button
                              onClick={() => handleRemoveMember(member.id, member.user.fullName || member.user.email)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--error)]/10"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Remove from Team
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-[var(--card-border)] p-8 text-center">
            <UsersIcon className="mx-auto h-8 w-8 text-foreground-muted" />
            <p className="mt-2 text-sm text-foreground">No team members yet</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Invite team members to collaborate on projects
            </p>
          </div>
        )}
      </div>

      {/* Role Permissions */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Role Permissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="py-3 text-left font-medium text-foreground-muted">Permission</th>
                <th className="py-3 text-center font-medium text-foreground-muted">Owner</th>
                <th className="py-3 text-center font-medium text-foreground-muted">Admin</th>
                <th className="py-3 text-center font-medium text-foreground-muted">Member</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              <PermissionRow permission="View galleries" owner admin member />
              <PermissionRow permission="Create galleries" owner admin member />
              <PermissionRow permission="Edit all galleries" owner admin />
              <PermissionRow permission="Delete galleries" owner admin />
              <PermissionRow permission="Manage clients" owner admin member />
              <PermissionRow permission="View payments" owner admin />
              <PermissionRow permission="Manage team" owner admin />
              <PermissionRow permission="Billing & subscription" owner />
              <PermissionRow permission="Delete organization" owner />
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </div>
  );
}

function PermissionRow({ permission, owner, admin, member }: { permission: string; owner?: boolean; admin?: boolean; member?: boolean }) {
  return (
    <tr>
      <td className="py-3 text-foreground">{permission}</td>
      <td className="py-3 text-center">
        {owner ? <CheckIcon className="inline h-5 w-5 text-[var(--success)]" /> : <XIcon className="inline h-5 w-5 text-foreground-muted" />}
      </td>
      <td className="py-3 text-center">
        {admin ? <CheckIcon className="inline h-5 w-5 text-[var(--success)]" /> : <XIcon className="inline h-5 w-5 text-foreground-muted" />}
      </td>
      <td className="py-3 text-center">
        {member ? <CheckIcon className="inline h-5 w-5 text-[var(--success)]" /> : <XIcon className="inline h-5 w-5 text-foreground-muted" />}
      </td>
    </tr>
  );
}

// Team-specific icons (not in shared library)
function MoreIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Z" clipRule="evenodd" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}
