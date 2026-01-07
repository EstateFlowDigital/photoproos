export const dynamic = "force-dynamic";

import { PageHeader, PageContextNav } from "@/components/dashboard";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { SETTINGS_PAGE_CATEGORIES, type SettingsIconName } from "@/lib/constants/settings-navigation";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";
import {
  ChevronRightIcon,
  UserIcon,
  PaletteIcon,
  CreditCardIcon,
  StripeIcon,
  BankIcon,
  UsersIcon,
  MapIcon,
  GiftIcon,
  MailIcon,
  MailOutlineIcon,
  MessageIcon,
  BellIcon,
  PlugIcon,
  CalendarIcon,
  DropboxIcon,
  SparklesIcon,
  CarIcon,
  CameraIcon,
  LayersIcon,
  CodeIcon,
  PackageIcon,
  ImageIcon,
  HelpCircleIcon,
  ZapIcon,
} from "@/components/ui/settings-icons";
import { SettingsPageClient } from "./settings-page-client";

// ============================================================================
// Icon Mapping
// ============================================================================

const ICON_MAP: Record<SettingsIconName, React.FC<{ className?: string }>> = {
  user: UserIcon,
  palette: PaletteIcon,
  creditCard: CreditCardIcon,
  stripe: StripeIcon,
  bank: BankIcon,
  users: UsersIcon,
  map: MapIcon,
  gift: GiftIcon,
  mail: MailIcon,
  mailOutline: MailOutlineIcon,
  message: MessageIcon,
  bell: BellIcon,
  plug: PlugIcon,
  calendar: CalendarIcon,
  dropbox: DropboxIcon,
  sparkles: SparklesIcon,
  car: CarIcon,
  camera: CameraIcon,
  layers: LayersIcon,
  code: CodeIcon,
  package: PackageIcon,
  image: ImageIcon,
  helpCircle: HelpCircleIcon,
  zap: ZapIcon,
};

// ============================================================================
// Components
// ============================================================================

interface SettingCardProps {
  title: string;
  description: string;
  href: string;
  iconName: SettingsIconName;
}

function SettingCard({ title, description, href, iconName }: SettingCardProps) {
  const IconComponent = ICON_MAP[iconName];

  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--background-secondary)] text-foreground-muted transition-colors group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
        {IconComponent && <IconComponent className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-foreground-muted transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-foreground-muted">{description}</p>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">{children}</div>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default async function SettingsPage() {
  // Fetch organization info for the client components
  const auth = await getAuthContext();
  let organizationName = "your organization";
  let organizationId: string | undefined;

  if (auth) {
    organizationId = auth.organizationId;
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: { name: true },
    });
    if (organization?.name) {
      organizationName = organization.name;
    }
  }

  // Fetch walkthrough preference
  const walkthroughPreferenceResult = await getWalkthroughPreference("settings");
  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  return (
    <div className="space-y-8">
      {/* Page Walkthrough */}
      <WalkthroughWrapper
        pageId="settings"
        initialState={walkthroughState}
      />

      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      {/* Quick Navigation */}
      <PageContextNav
        items={[
          { label: "Appearance", href: "/settings/appearance", icon: <SparklesIcon className="h-4 w-4" /> },
          { label: "Profile", href: "/settings/profile", icon: <UserIcon className="h-4 w-4" /> },
          { label: "Billing", href: "/settings/billing", icon: <CreditCardIcon className="h-4 w-4" /> },
          { label: "Team", href: "/settings/team", icon: <UsersIcon className="h-4 w-4" /> },
          { label: "Branding", href: "/settings/branding", icon: <PaletteIcon className="h-4 w-4" /> },
        ]}
        integrations={[
          { label: "Stripe", href: "/settings/payments", icon: <StripeIcon className="h-4 w-4" /> },
        ]}
      />

      {/* Settings Categories */}
      <div className="space-y-10">
        {SETTINGS_PAGE_CATEGORIES.map((category) => (
          <SettingsSection
            key={category.id}
            title={category.label}
            description={category.description}
          >
            {category.items.map((item) => (
              <SettingCard
                key={item.id}
                title={item.label}
                description={item.description}
                href={item.href}
                iconName={item.iconName}
              />
            ))}
          </SettingsSection>
        ))}
      </div>

      {/* Onboarding & Danger Zone */}
      <SettingsPageClient
        organizationName={organizationName}
        organizationId={organizationId}
      />
    </div>
  );
}
