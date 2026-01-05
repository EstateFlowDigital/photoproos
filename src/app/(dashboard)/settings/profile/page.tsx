export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getBillingStats } from "@/lib/actions/settings";
import { ProfileSettingsForm } from "./profile-settings-form";

export default async function ProfileSettingsPage() {
  const [currentUser, billingStats] = await Promise.all([
    getCurrentUser(),
    getBillingStats(),
  ]);

  const user = currentUser?.user;
  const org = currentUser?.organization;
  const role = currentUser?.role || "member";

  const planLabels = {
    free: "Free",
    pro: "Pro",
    studio: "Studio",
    enterprise: "Enterprise",
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        subtitle="Manage your personal information and preferences"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileSettingsForm
            user={{
              id: user?.id || "",
              fullName: user?.fullName || "",
              email: user?.email || "",
              phone: user?.phone || "",
              avatarUrl: user?.avatarUrl || null,
            }}
            organization={{
              id: org?.id || "",
              name: org?.name || "",
              timezone: org?.timezone || "America/New_York",
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Account Status</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Plan</span>
                <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--primary)]">
                  {planLabels[billingStats?.plan || "free"]}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Role</span>
                <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-2.5 py-1 text-xs font-medium text-[var(--success)] capitalize">
                  {role}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Member Since</span>
                <span className="text-sm font-medium text-foreground">
                  {formatDate(billingStats?.memberSince)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href="/settings/billing"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <CreditCardIcon className="h-4 w-4 text-foreground-muted" />
                Manage Billing
              </Link>
              <Link
                href="/settings/team"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <UsersIcon className="h-4 w-4 text-foreground-muted" />
                Team Members
              </Link>
              <Link
                href="/settings/notifications"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <BellIcon className="h-4 w-4 text-foreground-muted" />
                Notifications
              </Link>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
            <h2 className="text-lg font-semibold text-[var(--error)] mb-4">Danger Zone</h2>
            <p className="text-sm text-foreground-secondary mb-4">
              Permanently delete your account and all associated data.
            </p>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)] px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
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

function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z" clipRule="evenodd" />
    </svg>
  );
}
