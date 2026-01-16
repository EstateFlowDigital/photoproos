"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InviteModal, PendingInvitations } from "./invite-modal";
import { ArrowLeftIcon, PlusIcon, CheckIcon, XIcon, UsersIcon, ShieldIcon, UserIcon, TrashIcon } from "@/components/ui/settings-icons";
import { updateMemberRole, removeMember } from "@/lib/actions/settings";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";

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
  owner: { label: "Owner", color: "bg-[var(--ai)]/10 text-[var(--ai)]" },
  admin: { label: "Admin", color: "bg-[var(--primary)]/10 text-[var(--primary)]" },
  member: { label: "Member", color: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]" },
};

export function TeamPageClient({ members, pendingInvitations, memberLimit }: TeamPageClientProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const inviteHandledRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const confirm = useConfirm();

  const canInvite = memberLimit === -1 || members.length < memberLimit;
  const inviteParam = searchParams?.get("invite");

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setFocusedIndex(-1);
      }
    };
    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [openDropdown]);

  // Focus management for dropdown menu items
  useEffect(() => {
    if (openDropdown && dropdownRef.current && focusedIndex >= 0) {
      const items = dropdownRef.current.querySelectorAll('[role="menuitem"]');
      (items[focusedIndex] as HTMLElement)?.focus();
    }
  }, [focusedIndex, openDropdown]);

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

  const handleRoleChange = (memberId: string, newRole: "admin" | "member") => {
    startTransition(async () => {
      const result = await updateMemberRole(memberId, newRole);
      if (result.success) {
        toast.success(`Role updated to ${newRole}`);
      } else {
        toast.error(result.error || "Failed to update role");
      }
      setOpenDropdown(null);
      setFocusedIndex(-1);
    });
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const confirmed = await confirm({
      title: "Remove Team Member",
      description: `Are you sure you want to remove ${memberName} from the team? This action cannot be undone.`,
      confirmText: "Remove",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) {
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
      setFocusedIndex(-1);
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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
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
                    {member.role !== "owner" && (() => {
                      const menuItems = [
                        ...(member.role !== "admin" ? [{ action: "admin" as const, label: "Make Admin", Icon: ShieldIcon, iconClass: "text-[var(--primary)]" }] : []),
                        ...(member.role !== "member" ? [{ action: "member" as const, label: "Make Member", Icon: UserIcon, iconClass: "text-[var(--foreground-muted)]" }] : []),
                        { action: "remove" as const, label: "Remove from Team", Icon: TrashIcon, iconClass: "text-[var(--error)]", isDestructive: true },
                      ];
                      return (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === member.id ? null : member.id);
                              setFocusedIndex(-1);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setOpenDropdown(openDropdown === member.id ? null : member.id);
                                setFocusedIndex(0);
                              } else if (e.key === "ArrowDown" && openDropdown !== member.id) {
                                e.preventDefault();
                                setOpenDropdown(member.id);
                                setFocusedIndex(0);
                              }
                            }}
                            aria-haspopup="menu"
                            aria-expanded={openDropdown === member.id}
                            aria-label={`Actions for ${member.user.fullName || member.user.email}`}
                            className="rounded-lg bg-[var(--background-hover)] p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                            disabled={isPending}
                          >
                            <MoreIcon className="h-4 w-4" />
                          </button>
                          {openDropdown === member.id && (
                            <div
                              ref={dropdownRef}
                              role="menu"
                              aria-label="Member actions"
                              className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => handleDropdownKeyNav(e, menuItems.length)}
                            >
                              <div className="px-3 py-2 text-xs font-medium text-foreground-muted" id={`role-section-${member.id}`}>
                                Change Role
                              </div>
                              {menuItems.map((item, index) => (
                                <button
                                  key={item.action}
                                  role="menuitem"
                                  tabIndex={focusedIndex === index ? 0 : -1}
                                  onClick={() => {
                                    if (item.action === "remove") {
                                      handleRemoveMember(member.id, member.user.fullName || member.user.email);
                                    } else {
                                      handleRoleChange(member.id, item.action);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      if (item.action === "remove") {
                                        handleRemoveMember(member.id, member.user.fullName || member.user.email);
                                      } else {
                                        handleRoleChange(member.id, item.action);
                                      }
                                    }
                                  }}
                                  className={cn(
                                    "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:bg-[var(--background-hover)]",
                                    item.isDestructive
                                      ? "text-[var(--error)] hover:bg-[var(--error)]/10 border-t border-[var(--card-border)] mt-1"
                                      : "text-foreground hover:bg-[var(--background-hover)]"
                                  )}
                                >
                                  <item.Icon className={cn("h-4 w-4", item.iconClass)} />
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
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

