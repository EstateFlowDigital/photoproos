export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";

// Demo user data
const demoUser = {
  fullName: "Alex Thompson",
  email: "alex@photoproos.com",
  phone: "(555) 123-4567",
  businessName: "Thompson Photography",
  website: "https://thompsonphoto.com",
  timezone: "America/Los_Angeles",
  avatarUrl: null,
};

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        subtitle="Manage your personal information and preferences"
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Settings
          </Link>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Changes will not be saved. This is a preview of the profile settings.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Avatar Section */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-2xl font-bold">
              {demoUser.fullName.charAt(0)}
            </div>
            <div className="space-y-2">
              <button className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
                Upload Photo
              </button>
              <p className="text-xs text-foreground-muted">JPG, PNG or WebP. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <form className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                defaultValue={demoUser.fullName}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={demoUser.email}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={demoUser.phone}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
        </form>

        {/* Business Information */}
        <form className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Business Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-foreground mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                defaultValue={demoUser.businessName}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-foreground mb-1.5">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                defaultValue={demoUser.website}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-foreground mb-1.5">
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                defaultValue={demoUser.timezone}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
              </select>
            </div>
          </div>
        </form>

        {/* Password Section */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Password</h2>
          <p className="text-sm text-foreground-muted mb-4">
            Change your password to keep your account secure.
          </p>
          <button className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">
            Change Password
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled
            className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
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
