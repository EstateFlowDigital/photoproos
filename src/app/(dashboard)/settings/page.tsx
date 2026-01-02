export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";

interface SettingCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function SettingCard({ title, description, href, icon }: SettingCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)] text-foreground-muted transition-colors group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-foreground-muted transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

import { SettingsPageClient } from "./settings-page-client";

export default async function SettingsPage() {
  // Fetch organization name for the danger zone component
  const auth = await getAuthContext();
  let organizationName = "your organization";

  if (auth) {
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: { name: true },
    });
    if (organization?.name) {
      organizationName = organization.name;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SettingCard
          title="Profile"
          description="Update your personal information and avatar"
          href="/settings/profile"
          icon={<UserIcon className="h-5 w-5" />}
        />
        <SettingCard
          title="Billing"
          description="Manage your subscription and payment methods"
          href="/settings/billing"
          icon={<CreditCardIcon className="h-5 w-5" />}
        />
        <SettingCard
          title="Payments"
          description="Connect Stripe to accept payments from clients"
          href="/settings/payments"
          icon={<StripeIcon className="h-5 w-5" />}
        />
        <SettingCard
          title="Team"
          description="Invite team members and manage permissions"
          href="/settings/team"
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <SettingCard
          title="Branding"
          description="Customize your galleries with your logo and colors"
          href="/settings/branding"
          icon={<PaletteIcon className="h-5 w-5" />}
        />
        <SettingCard
          title="Notifications"
          description="Configure email and push notification preferences"
          href="/settings/notifications"
          icon={<BellIcon className="h-5 w-5" />}
        />
        <SettingCard
          title="Integrations"
          description="Connect third-party apps and services"
          href="/settings/integrations"
          icon={<PlugIcon className="h-5 w-5" />}
        />
        <SettingCard
          title="Travel & Mileage"
          description="Configure travel fees, mileage rates, and home base location"
          href="/settings/travel"
          icon={<CarIcon className="h-5 w-5" />}
        />
        <SettingCard
          title="Equipment"
          description="Manage your photography equipment inventory"
          href="/settings/equipment"
          icon={<CameraIcon className="h-5 w-5" />}
        />
        <SettingCard
          title="Industries & Features"
          description="Customize your workflow based on your photography focus"
          href="/settings/features"
          icon={<LayersIcon className="h-5 w-5" />}
        />
      </div>

      {/* Danger Zone */}
      <SettingsPageClient organizationName={organizationName} />
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
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

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM6.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM10 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3.5 2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
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

function PlugIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M14 6H6v8h8V6Z" />
      <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v11.5A2.25 2.25 0 0 1 15.75 18H4.25A2.25 2.25 0 0 1 2 15.75V4.25ZM4.25 3.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h11.5a.75.75 0 0 0 .75-.75V4.25a.75.75 0 0 0-.75-.75H4.25Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.5 3c-1.051 0-2.093.04-3.125.117A1.49 1.49 0 002 4.607V10.5h-.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5H2v.5a1 1 0 001 1h1a1 1 0 001-1v-.5h10v.5a1 1 0 001 1h1a1 1 0 001-1v-.5h.5a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5H18V4.607a1.49 1.49 0 00-1.375-1.49A49.214 49.214 0 0013.5 3h-7zM5 8a1 1 0 11-2 0 1 1 0 012 0zm12 0a1 1 0 11-2 0 1 1 0 012 0zM6.5 5h7a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.196 12.87l-.825.483a.75.75 0 0 0 0 1.294l7.25 4.25a.75.75 0 0 0 .758 0l7.25-4.25a.75.75 0 0 0 0-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 0 1-2.276 0L3.196 12.87Z" />
      <path d="M3.196 8.87l-.825.483a.75.75 0 0 0 0 1.294l7.25 4.25a.75.75 0 0 0 .758 0l7.25-4.25a.75.75 0 0 0 0-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 0 1-2.276 0L3.196 8.87Z" />
      <path d="M10.38 1.103a.75.75 0 0 0-.76 0l-7.25 4.25a.75.75 0 0 0 0 1.294l7.25 4.25a.75.75 0 0 0 .76 0l7.25-4.25a.75.75 0 0 0 0-1.294l-7.25-4.25Z" />
    </svg>
  );
}
