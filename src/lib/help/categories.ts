/**
 * Help Categories
 *
 * Category definitions for the Help & Support Center.
 */

import type { HelpCategory, HelpCategoryId } from "./types";

// ============================================================================
// Categories
// ============================================================================

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "New to PhotoProOS? Start here with our quick setup guides.",
    icon: "rocket",
    articleCount: 6,
    slug: "getting-started",
  },
  {
    id: "galleries",
    title: "Galleries",
    description: "Learn how to create, customize, and deliver photo galleries.",
    icon: "image",
    articleCount: 12,
    slug: "galleries",
  },
  {
    id: "clients",
    title: "Clients",
    description: "Manage your client relationships and communications.",
    icon: "users",
    articleCount: 8,
    slug: "clients",
  },
  {
    id: "invoicing",
    title: "Invoicing & Payments",
    description: "Create invoices, accept payments, and track revenue.",
    icon: "creditCard",
    articleCount: 15,
    slug: "invoicing",
  },
  {
    id: "contracts",
    title: "Contracts",
    description: "Create and send professional contracts with e-signatures.",
    icon: "fileText",
    articleCount: 6,
    slug: "contracts",
  },
  {
    id: "calendar",
    title: "Calendar & Scheduling",
    description: "Manage your bookings, availability, and calendar sync.",
    icon: "calendar",
    articleCount: 5,
    slug: "calendar",
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect with Stripe, QuickBooks, Calendly, and more.",
    icon: "plug",
    articleCount: 10,
    slug: "integrations",
  },
  {
    id: "settings",
    title: "Account & Settings",
    description: "Configure your account, branding, and preferences.",
    icon: "settings",
    articleCount: 8,
    slug: "settings",
  },
];

// ============================================================================
// Helpers
// ============================================================================

export function getCategory(categoryId: HelpCategoryId): HelpCategory | undefined {
  return HELP_CATEGORIES.find((cat) => cat.id === categoryId);
}

export function getCategoryBySlug(slug: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find((cat) => cat.slug === slug);
}

export function getCategoryLabel(categoryId: HelpCategoryId): string {
  const category = getCategory(categoryId);
  return category?.title ?? categoryId;
}
