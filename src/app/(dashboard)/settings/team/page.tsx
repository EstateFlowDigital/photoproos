export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo team data
const demoTeam = {
  members: [
    { id: "1", name: "Alex Thompson", email: "alex@photoproos.com", role: "owner", status: "active", avatarUrl: null, joinedAt: "2024-01-15" },
    { id: "2", name: "Sarah Chen", email: "sarah@photoproos.com", role: "admin", status: "active", avatarUrl: null, joinedAt: "2024-06-10" },
    { id: "3", name: "Mike Johnson", email: "mike@photoproos.com", role: "member", status: "active", avatarUrl: null, joinedAt: "2024-09-20" },
  ],
  pendingInvites: [
    { id: "inv1", email: "jessica@email.com", role: "member", sentAt: "2024-12-20", expiresAt: "2024-12-27" },
  ],
  limit: 3,
};

const roleLabels = {
  owner: { label: "Owner", color: "bg-purple-500/10 text-purple-400" },
  admin: { label: "Admin", color: "bg-blue-500/10 text-blue-400" },
  member: { label: "Member", color: "bg-gray-500/10 text-gray-400" },
};

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        subtitle="Manage your team and permissions"
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
            <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
              <PlusIcon className="h-4 w-4" />
              Invite Member
            </button>
          </div>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Team management is disabled. This is a preview of the team settings.
        </p>
      </div>

      {/* Team Limit */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground-muted">Team Members</p>
            <p className="text-lg font-semibold text-foreground">
              {demoTeam.members.length} / {demoTeam.limit} seats used
            </p>
          </div>
          <div className="w-32">
            <div className="h-2 rounded-full bg-[var(--background-secondary)]">
              <div
                className="h-full rounded-full bg-[var(--primary)]"
                style={{ width: `${(demoTeam.members.length / demoTeam.limit) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Members */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Members</h2>
        <div className="space-y-3">
          {demoTeam.members.map((member) => {
            const roleInfo = roleLabels[member.role as keyof typeof roleLabels];
            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-foreground-muted">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", roleInfo.color)}>
                    {roleInfo.label}
                  </span>
                  <p className="text-sm text-foreground-muted">
                    Joined {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </p>
                  {member.role !== "owner" && (
                    <button className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground">
                      <MoreIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invites */}
      {demoTeam.pendingInvites.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Pending Invitations</h2>
          <div className="space-y-3">
            {demoTeam.pendingInvites.map((invite) => {
              const roleInfo = roleLabels[invite.role as keyof typeof roleLabels];
              return (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background)] p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--warning)]/10 text-[var(--warning)]">
                      <ClockIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{invite.email}</p>
                      <p className="text-sm text-foreground-muted">
                        Sent {new Date(invite.sentAt).toLocaleDateString()} • Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", roleInfo.color)}>
                      {roleInfo.label}
                    </span>
                    <button className="text-sm font-medium text-[var(--primary)] hover:underline">
                      Resend
                    </button>
                    <button className="text-sm font-medium text-[var(--error)] hover:underline">
                      Revoke
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
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
