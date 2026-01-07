export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CreditCardIcon, UsersIcon, BellIcon } from "@/components/ui/settings-icons";
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
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

