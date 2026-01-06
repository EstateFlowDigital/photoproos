/**
 * Settings Navigation Structure
 * Defines all settings sections organized by category for the settings sidebar.
 */

import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/settings-icons";

// ============================================================================
// Types
// ============================================================================

export interface SettingsNavItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
  description?: string;
  badge?: string;
}

export interface SettingsNavCategory {
  id: string;
  label: string;
  items: SettingsNavItem[];
  defaultOpen?: boolean;
}

// ============================================================================
// Icon Imports (lazy to avoid circular dependencies)
// ============================================================================

// We import icons dynamically in the component to avoid SSR issues
// This file defines the structure, icons are mapped in the sidebar component

export type SettingsIconName =
  | "user"
  | "palette"
  | "creditCard"
  | "stripe"
  | "bank"
  | "users"
  | "map"
  | "gift"
  | "mail"
  | "mailOutline"
  | "message"
  | "bell"
  | "plug"
  | "calendar"
  | "dropbox"
  | "sparkles"
  | "car"
  | "camera"
  | "layers"
  | "code"
  | "package"
  | "image";

export interface SettingsNavItemWithIconName {
  id: string;
  label: string;
  href: string;
  iconName: SettingsIconName;
  description?: string;
  badge?: string;
}

export interface SettingsNavCategoryWithIconNames {
  id: string;
  label: string;
  items: SettingsNavItemWithIconName[];
  defaultOpen?: boolean;
}

// ============================================================================
// Navigation Structure
// ============================================================================

export const SETTINGS_NAVIGATION: SettingsNavCategoryWithIconNames[] = [
  {
    id: "account",
    label: "Account",
    defaultOpen: true,
    items: [
      {
        id: "profile",
        label: "Profile",
        href: "/settings/profile",
        iconName: "user",
        description: "Personal information and avatar",
      },
      {
        id: "appearance",
        label: "Appearance",
        href: "/settings/appearance",
        iconName: "palette",
        description: "Theme, colors, and display settings",
      },
      {
        id: "billing",
        label: "Billing",
        href: "/settings/billing",
        iconName: "creditCard",
        description: "Subscription and payment methods",
      },
    ],
  },
  {
    id: "business",
    label: "Business & Payments",
    defaultOpen: true,
    items: [
      {
        id: "payments",
        label: "Payments",
        href: "/settings/payments",
        iconName: "stripe",
        description: "Stripe integration for receiving payments",
      },
      {
        id: "payouts",
        label: "Payouts",
        href: "/settings/payouts",
        iconName: "bank",
        description: "Configure payout settings",
      },
      {
        id: "photographer-pay",
        label: "Photographer Pay",
        href: "/settings/photographer-pay",
        iconName: "users",
        description: "Contractor payment rates",
      },
    ],
  },
  {
    id: "team",
    label: "Team",
    defaultOpen: false,
    items: [
      {
        id: "team",
        label: "Team Members",
        href: "/settings/team",
        iconName: "users",
        description: "Invite and manage team members",
      },
      {
        id: "territories",
        label: "Territories",
        href: "/settings/territories",
        iconName: "map",
        description: "Geographic service areas",
      },
      {
        id: "referrals",
        label: "Referrals",
        href: "/settings/referrals",
        iconName: "gift",
        description: "Referral program management",
      },
      {
        id: "my-referrals",
        label: "My Referrals",
        href: "/settings/my-referrals",
        iconName: "gift",
        description: "Track your referrals",
      },
    ],
  },
  {
    id: "communications",
    label: "Communications",
    defaultOpen: false,
    items: [
      {
        id: "email",
        label: "Email Settings",
        href: "/settings/email",
        iconName: "mail",
        description: "Sender configuration and preferences",
      },
      {
        id: "email-logs",
        label: "Email Logs",
        href: "/settings/email-logs",
        iconName: "mailOutline",
        description: "Track sent emails",
      },
      {
        id: "sms",
        label: "SMS",
        href: "/settings/sms",
        iconName: "message",
        description: "Text message settings",
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/settings/notifications",
        iconName: "bell",
        description: "Notification preferences",
      },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    defaultOpen: false,
    items: [
      {
        id: "integrations",
        label: "All Integrations",
        href: "/settings/integrations",
        iconName: "plug",
        description: "Third-party app connections",
      },
      {
        id: "calendar",
        label: "Google Calendar",
        href: "/settings/calendar",
        iconName: "calendar",
        description: "Calendar sync settings",
      },
      {
        id: "dropbox",
        label: "Dropbox",
        href: "/settings/dropbox",
        iconName: "dropbox",
        description: "Photo storage sync",
      },
    ],
  },
  {
    id: "workflow",
    label: "Workflow",
    defaultOpen: false,
    items: [
      {
        id: "branding",
        label: "Branding",
        href: "/settings/branding",
        iconName: "sparkles",
        description: "Logo and gallery customization",
      },
      {
        id: "gallery-addons",
        label: "Gallery Add-ons",
        href: "/settings/gallery-addons",
        iconName: "package",
        description: "Upsell services in galleries",
      },
      {
        id: "travel",
        label: "Travel & Mileage",
        href: "/settings/travel",
        iconName: "car",
        description: "Travel fees and rates",
      },
      {
        id: "equipment",
        label: "Equipment",
        href: "/settings/equipment",
        iconName: "camera",
        description: "Equipment inventory",
      },
      {
        id: "features",
        label: "Industries & Features",
        href: "/settings/features",
        iconName: "layers",
        description: "Module toggles and workflows",
      },
      {
        id: "mls-presets",
        label: "MLS Presets",
        href: "/settings/mls-presets",
        iconName: "image",
        description: "Download dimension presets",
      },
    ],
  },
  {
    id: "developer",
    label: "Developer",
    defaultOpen: false,
    items: [
      {
        id: "developer",
        label: "Developer Tools",
        href: "/settings/developer",
        iconName: "code",
        description: "Database seeding and testing",
      },
    ],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all settings items as a flat list
 */
export function getAllSettingsItems(): SettingsNavItemWithIconName[] {
  return SETTINGS_NAVIGATION.flatMap((category) => category.items);
}

/**
 * Find a settings item by its href
 */
export function findSettingsItemByHref(
  href: string
): SettingsNavItemWithIconName | undefined {
  return getAllSettingsItems().find((item) => item.href === href);
}

/**
 * Find the category for a given settings item href
 */
export function findCategoryForHref(
  href: string
): SettingsNavCategoryWithIconNames | undefined {
  return SETTINGS_NAVIGATION.find((category) =>
    category.items.some((item) => item.href === href)
  );
}

/**
 * Check if a href is within a category
 */
export function isHrefInCategory(href: string, categoryId: string): boolean {
  const category = SETTINGS_NAVIGATION.find((cat) => cat.id === categoryId);
  if (!category) return false;
  return category.items.some(
    (item) => href === item.href || href.startsWith(`${item.href}/`)
  );
}

/**
 * Get the active category id for a given href
 */
export function getActiveCategoryId(href: string): string | undefined {
  for (const category of SETTINGS_NAVIGATION) {
    for (const item of category.items) {
      if (href === item.href || href.startsWith(`${item.href}/`)) {
        return category.id;
      }
    }
  }
  return undefined;
}

// ============================================================================
// Settings Page Categories (for main settings landing page)
// ============================================================================

export interface SettingsPageCategory {
  id: string;
  label: string;
  description?: string;
  items: {
    id: string;
    label: string;
    description: string;
    href: string;
    iconName: SettingsIconName;
  }[];
}

export const SETTINGS_PAGE_CATEGORIES: SettingsPageCategory[] = [
  {
    id: "personal",
    label: "Personal",
    description: "Manage your account and preferences",
    items: [
      {
        id: "appearance",
        label: "Appearance",
        description: "Personalize your dashboard theme and colors",
        href: "/settings/appearance",
        iconName: "sparkles",
      },
      {
        id: "profile",
        label: "Profile",
        description: "Update your personal information and avatar",
        href: "/settings/profile",
        iconName: "user",
      },
    ],
  },
  {
    id: "business",
    label: "Business",
    description: "Billing, payments, and financial settings",
    items: [
      {
        id: "billing",
        label: "Billing",
        description: "Manage your subscription and payment methods",
        href: "/settings/billing",
        iconName: "creditCard",
      },
      {
        id: "payments",
        label: "Payments",
        description: "Connect Stripe to accept payments from clients",
        href: "/settings/payments",
        iconName: "stripe",
      },
      {
        id: "payouts",
        label: "Payouts",
        description: "Configure how you receive payments",
        href: "/settings/payouts",
        iconName: "bank",
      },
      {
        id: "photographer-pay",
        label: "Photographer Pay",
        description: "Set payment rates for contractors",
        href: "/settings/photographer-pay",
        iconName: "users",
      },
    ],
  },
  {
    id: "team",
    label: "Team & Collaboration",
    description: "Manage your team and referrals",
    items: [
      {
        id: "team",
        label: "Team",
        description: "Invite team members and manage permissions",
        href: "/settings/team",
        iconName: "users",
      },
      {
        id: "territories",
        label: "Territories",
        description: "Define your geographic service areas",
        href: "/settings/territories",
        iconName: "map",
      },
      {
        id: "referrals",
        label: "Referrals",
        description: "Manage your referral program",
        href: "/settings/referrals",
        iconName: "gift",
      },
    ],
  },
  {
    id: "communications",
    label: "Communications",
    description: "Email, SMS, and notification settings",
    items: [
      {
        id: "notifications",
        label: "Notifications",
        description: "Configure email and push notification preferences",
        href: "/settings/notifications",
        iconName: "bell",
      },
      {
        id: "email",
        label: "Email Settings",
        description: "Configure sender information and email preferences",
        href: "/settings/email",
        iconName: "mail",
      },
      {
        id: "email-logs",
        label: "Email Logs",
        description: "Track sent emails and resend failed messages",
        href: "/settings/email-logs",
        iconName: "mailOutline",
      },
      {
        id: "sms",
        label: "SMS",
        description: "Configure text message settings",
        href: "/settings/sms",
        iconName: "message",
      },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connect third-party services",
    items: [
      {
        id: "integrations",
        label: "All Integrations",
        description: "Connect third-party apps and services",
        href: "/settings/integrations",
        iconName: "plug",
      },
      {
        id: "calendar",
        label: "Google Calendar",
        description: "Sync bookings with your calendar",
        href: "/settings/calendar",
        iconName: "calendar",
      },
      {
        id: "dropbox",
        label: "Dropbox",
        description: "Backup photos and sync deliverables",
        href: "/settings/dropbox",
        iconName: "dropbox",
      },
    ],
  },
  {
    id: "workflow",
    label: "Workflow",
    description: "Customize your business operations",
    items: [
      {
        id: "branding",
        label: "Branding",
        description: "Customize your galleries with your logo and colors",
        href: "/settings/branding",
        iconName: "sparkles",
      },
      {
        id: "gallery-addons",
        label: "Gallery Add-ons",
        description: "Configure upsell services clients can request from galleries",
        href: "/settings/gallery-addons",
        iconName: "package",
      },
      {
        id: "travel",
        label: "Travel & Mileage",
        description: "Configure travel fees, mileage rates, and home base",
        href: "/settings/travel",
        iconName: "car",
      },
      {
        id: "equipment",
        label: "Equipment",
        description: "Manage your photography equipment inventory",
        href: "/settings/equipment",
        iconName: "camera",
      },
      {
        id: "features",
        label: "Industries & Features",
        description: "Customize your workflow based on your focus",
        href: "/settings/features",
        iconName: "layers",
      },
      {
        id: "mls-presets",
        label: "MLS Presets",
        description: "Configure image dimension presets for MLS downloads",
        href: "/settings/mls-presets",
        iconName: "image",
      },
    ],
  },
  {
    id: "developer",
    label: "Developer",
    description: "Tools for development and testing",
    items: [
      {
        id: "developer",
        label: "Developer Tools",
        description: "Seed database with sample data for testing",
        href: "/settings/developer",
        iconName: "code",
      },
    ],
  },
];
