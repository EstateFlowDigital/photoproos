"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { InviteModal, PendingInvitations } from "./invite-modal";

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
  const searchParams = useSearchParams();
  const inviteHandledRef = useRef(false);

  const canInvite = memberLimit === -1 || members.length < memberLimit;
  const inviteParam = searchParams.get("invite");

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team Members</h1>
          <p className="text-sm text-foreground-muted mt-1">Manage your team and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Link>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            disabled={!canInvite}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-4 w-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Team Limit */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground-muted">Team Members</p>
            <p className="text-lg font-semibold text-foreground">
              {members.length} / {memberLimit === -1 ? "∞" : memberLimit} seats used
            </p>
          </div>
          {memberLimit !== -1 && (
            <div className="w-32">
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
                  className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
                      {(member.user.fullName || member.user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.user.fullName || member.user.email}</p>
                      <p className="text-sm text-foreground-muted">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
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
                      <button className="rounded-lg bg-[var(--background-hover)] p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground">
                        <MoreIcon className="h-4 w-4" />
                      </button>
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
          <table className="w-full text-sm">
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
