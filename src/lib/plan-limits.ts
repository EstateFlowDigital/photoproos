/**
 * Plan Limits System for PhotoProOS
 *
 * This module defines all plan-based limits and provides utilities for:
 * - Checking if a user has reached a limit
 * - Getting remaining quota
 * - Enforcing limits before actions
 *
 * Philosophy:
 * - Free plan is generous for occasional users (can use platform completely free)
 * - Limits are on things that cost money (storage, AI, emails)
 * - Limits push users toward upgrading when they grow
 * - All modules are accessible on all plans (with usage limits)
 */

import type { PlanName } from "@prisma/client";

// =============================================================================
// LIMIT DEFINITIONS
// =============================================================================

/**
 * All possible limit keys in the system
 */
export type LimitKey =
  // Storage & Files
  | "storage_gb"
  | "galleries_active"
  | "photos_per_gallery"
  // Clients & CRM
  | "clients_total"
  | "leads_total"
  // Team
  | "team_members"
  // Billing
  | "invoices_per_month"
  | "contracts_per_month"
  | "estimates_per_month"
  // Communication
  | "emails_per_month"
  | "sms_per_month"
  | "email_accounts_synced"
  // AI & Advanced
  | "ai_credits_per_month"
  | "marketing_generations_per_month"
  // Properties & Websites
  | "properties_active"
  | "portfolio_websites"
  | "custom_domains"
  // Scheduling
  | "bookings_per_month"
  | "booking_types"
  // Other
  | "questionnaire_templates"
  | "contract_templates"
  | "canned_responses"
  | "service_packages"
  | "discount_codes";

/**
 * Feature flags (boolean features, not numeric limits)
 */
export type FeatureKey =
  | "custom_branding"
  | "white_label"
  | "hide_platform_branding"
  | "custom_domain_org" // Org-level custom domain (not property)
  | "api_access"
  | "webhooks"
  | "sso_saml"
  | "priority_support"
  | "dedicated_support"
  | "advanced_analytics"
  | "batch_processing"
  | "tax_prep_export"
  | "referral_program"
  | "review_automation"
  | "ai_assistant"
  | "integrations_basic" // Zapier, Calendly
  | "integrations_advanced" // QuickBooks, custom
  | "property_custom_domains"; // Can purchase custom domains for properties

/**
 * Limit value: -1 means unlimited
 */
export type LimitValue = number;

/**
 * Plan limits configuration
 */
export interface PlanLimits {
  limits: Record<LimitKey, LimitValue>;
  features: Record<FeatureKey, boolean>;
}

/**
 * Complete plan configuration
 */
export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  // ===========================================================================
  // FREE PLAN - Generous for occasional users
  // ===========================================================================
  free: {
    limits: {
      // Storage & Files
      storage_gb: 25, // 25GB system storage included
      galleries_active: 5,
      photos_per_gallery: 100,
      // Clients & CRM
      clients_total: 25,
      leads_total: 50,
      // Team
      team_members: 1,
      // Billing
      invoices_per_month: 10,
      contracts_per_month: 3,
      estimates_per_month: 5,
      // Communication
      emails_per_month: 100,
      sms_per_month: 0, // No SMS on free
      email_accounts_synced: 1,
      // AI & Advanced
      ai_credits_per_month: 10,
      marketing_generations_per_month: 5,
      // Properties & Websites
      properties_active: 3,
      portfolio_websites: 1,
      custom_domains: 0, // No org-level custom domains
      // Scheduling
      bookings_per_month: 20,
      booking_types: 3,
      // Other
      questionnaire_templates: 3,
      contract_templates: 2,
      canned_responses: 5,
      service_packages: 5,
      discount_codes: 3,
    },
    features: {
      custom_branding: true, // Basic branding (logo, colors)
      white_label: false,
      hide_platform_branding: false,
      custom_domain_org: false,
      api_access: false,
      webhooks: false,
      sso_saml: false,
      priority_support: false,
      dedicated_support: false,
      advanced_analytics: false,
      batch_processing: false,
      tax_prep_export: false,
      referral_program: false,
      review_automation: false,
      ai_assistant: true, // Basic AI with credits
      integrations_basic: false,
      integrations_advanced: false,
      property_custom_domains: true, // Can PURCHASE per-property domains
    },
  },

  // ===========================================================================
  // PRO PLAN - $49/mo - For growing photographers
  // 500GB system storage included
  // Limited on operational features to encourage upgrade to Studio
  // ===========================================================================
  pro: {
    limits: {
      // Storage & Files - 500GB system storage
      storage_gb: 500, // 500GB system storage included
      galleries_active: 50, // Limited galleries (upgrade to Studio for unlimited)
      photos_per_gallery: 500,
      // Clients & CRM - Limited
      clients_total: 100,
      leads_total: 200,
      // Team - Limited
      team_members: 3,
      // Billing - Limited monthly caps
      invoices_per_month: 50,
      contracts_per_month: 25,
      estimates_per_month: 25,
      // Communication - Limited
      emails_per_month: 500,
      sms_per_month: 50,
      email_accounts_synced: 2,
      // AI & Advanced - Limited
      ai_credits_per_month: 100,
      marketing_generations_per_month: 25,
      // Properties & Websites - Limited
      properties_active: 25,
      portfolio_websites: 3,
      custom_domains: 1,
      // Scheduling - Limited
      bookings_per_month: 100,
      booking_types: 10,
      // Other - Limited
      questionnaire_templates: 10,
      contract_templates: 10,
      canned_responses: 25,
      service_packages: 20,
      discount_codes: 10,
    },
    features: {
      custom_branding: true,
      white_label: false,
      hide_platform_branding: false,
      custom_domain_org: true,
      api_access: false, // API access requires Studio
      webhooks: false, // Webhooks require Studio
      sso_saml: false,
      priority_support: true,
      dedicated_support: false,
      advanced_analytics: false,
      batch_processing: false,
      tax_prep_export: true,
      referral_program: true,
      review_automation: true,
      ai_assistant: true,
      integrations_basic: true,
      integrations_advanced: false,
      property_custom_domains: true,
    },
  },

  // ===========================================================================
  // STUDIO PLAN - $99/mo - For established studios & teams
  // Key value: UNLIMITED USAGE - Everything unlimited, 1TB system storage
  // Higher limits across all operational features for busy studios
  // ===========================================================================
  studio: {
    limits: {
      // Storage & Files - 1TB system storage included
      storage_gb: 1000, // 1TB system storage, can purchase overage
      galleries_active: -1, // Unlimited galleries
      photos_per_gallery: -1, // Unlimited photos per gallery
      // Clients & CRM - Unlimited
      clients_total: -1,
      leads_total: -1,
      // Team - Higher limit
      team_members: 10,
      // Billing - Unlimited
      invoices_per_month: -1,
      contracts_per_month: -1,
      estimates_per_month: -1,
      // Communication - Higher limits
      emails_per_month: -1, // Unlimited emails
      sms_per_month: 500, // Higher SMS limit
      email_accounts_synced: 10,
      // AI & Advanced - Higher limits
      ai_credits_per_month: 1000,
      marketing_generations_per_month: 250,
      // Properties & Websites - Higher limits
      properties_active: -1, // Unlimited properties
      portfolio_websites: -1, // Unlimited portfolios
      custom_domains: 10,
      // Scheduling - Unlimited
      bookings_per_month: -1,
      booking_types: -1,
      // Other - Unlimited
      questionnaire_templates: -1,
      contract_templates: -1,
      canned_responses: -1,
      service_packages: -1,
      discount_codes: -1,
    },
    features: {
      custom_branding: true,
      white_label: true,
      hide_platform_branding: true,
      custom_domain_org: true,
      api_access: true,
      webhooks: true,
      sso_saml: false,
      priority_support: true,
      dedicated_support: false,
      advanced_analytics: true,
      batch_processing: true,
      tax_prep_export: true,
      referral_program: true,
      review_automation: true,
      ai_assistant: true,
      integrations_basic: true,
      integrations_advanced: true,
      property_custom_domains: true,
    },
  },

  // ===========================================================================
  // ENTERPRISE PLAN - $349/mo - For agencies & large teams
  // Key value: UNLIMITED EVERYTHING + 10TB system storage included (soft cap)
  // Additional storage can be purchased at $199/10TB
  // ===========================================================================
  enterprise: {
    limits: {
      // Storage - 10TB system storage included (soft cap, marketed as "unlimited")
      storage_gb: 10000, // 10TB system storage included
      // Everything else - Truly unlimited
      galleries_active: -1,
      photos_per_gallery: -1,
      clients_total: -1,
      leads_total: -1,
      team_members: -1, // Unlimited team members
      invoices_per_month: -1,
      contracts_per_month: -1,
      estimates_per_month: -1,
      emails_per_month: -1,
      sms_per_month: -1, // Unlimited SMS
      email_accounts_synced: -1,
      ai_credits_per_month: -1, // Unlimited AI
      marketing_generations_per_month: -1,
      properties_active: -1,
      portfolio_websites: -1,
      custom_domains: -1, // Unlimited custom domains
      bookings_per_month: -1,
      booking_types: -1,
      questionnaire_templates: -1,
      contract_templates: -1,
      canned_responses: -1,
      service_packages: -1,
      discount_codes: -1,
    },
    features: {
      custom_branding: true,
      white_label: true,
      hide_platform_branding: true,
      custom_domain_org: true,
      api_access: true,
      webhooks: true,
      sso_saml: true, // Enterprise-only SSO/SAML
      priority_support: true,
      dedicated_support: true, // Enterprise-only dedicated support
      advanced_analytics: true,
      batch_processing: true,
      tax_prep_export: true,
      referral_program: true,
      review_automation: true,
      ai_assistant: true,
      integrations_basic: true,
      integrations_advanced: true,
      property_custom_domains: true,
    },
  },
};

// =============================================================================
// LIMIT METADATA (for UI display)
// =============================================================================

export interface LimitMetadata {
  name: string;
  description: string;
  category: "storage" | "crm" | "team" | "billing" | "communication" | "ai" | "websites" | "scheduling" | "other";
  unit?: string;
  showInBilling: boolean;
}

export const LIMIT_METADATA: Record<LimitKey, LimitMetadata> = {
  storage_gb: {
    name: "Storage",
    description: "Total file storage for photos and documents",
    category: "storage",
    unit: "GB",
    showInBilling: true,
  },
  galleries_active: {
    name: "Active Galleries",
    description: "Number of active photo galleries",
    category: "storage",
    showInBilling: true,
  },
  photos_per_gallery: {
    name: "Photos per Gallery",
    description: "Maximum photos in a single gallery",
    category: "storage",
    showInBilling: false,
  },
  clients_total: {
    name: "Clients",
    description: "Total client contacts",
    category: "crm",
    showInBilling: true,
  },
  leads_total: {
    name: "Leads",
    description: "Total lead contacts",
    category: "crm",
    showInBilling: false,
  },
  team_members: {
    name: "Team Members",
    description: "Users in your organization",
    category: "team",
    showInBilling: true,
  },
  invoices_per_month: {
    name: "Invoices",
    description: "Invoices sent per month",
    category: "billing",
    unit: "/mo",
    showInBilling: true,
  },
  contracts_per_month: {
    name: "Contracts",
    description: "Contracts sent per month",
    category: "billing",
    unit: "/mo",
    showInBilling: false,
  },
  estimates_per_month: {
    name: "Estimates",
    description: "Estimates sent per month",
    category: "billing",
    unit: "/mo",
    showInBilling: false,
  },
  emails_per_month: {
    name: "Emails",
    description: "Outbound emails per month",
    category: "communication",
    unit: "/mo",
    showInBilling: true,
  },
  sms_per_month: {
    name: "SMS Messages",
    description: "Text messages per month",
    category: "communication",
    unit: "/mo",
    showInBilling: false,
  },
  email_accounts_synced: {
    name: "Email Accounts",
    description: "Connected email accounts for inbox",
    category: "communication",
    showInBilling: false,
  },
  ai_credits_per_month: {
    name: "AI Credits",
    description: "AI assistant usage per month",
    category: "ai",
    unit: "/mo",
    showInBilling: true,
  },
  marketing_generations_per_month: {
    name: "Marketing Generations",
    description: "AI marketing content generations per month",
    category: "ai",
    unit: "/mo",
    showInBilling: false,
  },
  properties_active: {
    name: "Property Websites",
    description: "Active property listing pages",
    category: "websites",
    showInBilling: true,
  },
  portfolio_websites: {
    name: "Portfolio Websites",
    description: "Public portfolio showcase pages",
    category: "websites",
    showInBilling: false,
  },
  custom_domains: {
    name: "Custom Domains",
    description: "Custom domains for your organization",
    category: "websites",
    showInBilling: false,
  },
  bookings_per_month: {
    name: "Bookings",
    description: "Client bookings per month",
    category: "scheduling",
    unit: "/mo",
    showInBilling: false,
  },
  booking_types: {
    name: "Booking Types",
    description: "Different booking/service types",
    category: "scheduling",
    showInBilling: false,
  },
  questionnaire_templates: {
    name: "Questionnaire Templates",
    description: "Reusable questionnaire templates",
    category: "other",
    showInBilling: false,
  },
  contract_templates: {
    name: "Contract Templates",
    description: "Reusable contract templates",
    category: "other",
    showInBilling: false,
  },
  canned_responses: {
    name: "Canned Responses",
    description: "Quick reply templates",
    category: "other",
    showInBilling: false,
  },
  service_packages: {
    name: "Service Packages",
    description: "Photography service packages",
    category: "other",
    showInBilling: false,
  },
  discount_codes: {
    name: "Discount Codes",
    description: "Active discount/promo codes",
    category: "other",
    showInBilling: false,
  },
};

export interface FeatureMetadata {
  name: string;
  description: string;
  category: string;
}

export const FEATURE_METADATA: Record<FeatureKey, FeatureMetadata> = {
  custom_branding: {
    name: "Custom Branding",
    description: "Add your logo and brand colors",
    category: "branding",
  },
  white_label: {
    name: "White Label",
    description: "Remove platform branding from client-facing pages",
    category: "branding",
  },
  hide_platform_branding: {
    name: "Hide Platform Branding",
    description: "Remove 'Powered by' branding",
    category: "branding",
  },
  custom_domain_org: {
    name: "Custom Domain",
    description: "Use your own domain for your organization",
    category: "branding",
  },
  api_access: {
    name: "API Access",
    description: "Access to REST API for integrations",
    category: "integrations",
  },
  webhooks: {
    name: "Webhooks",
    description: "Receive webhook notifications for events",
    category: "integrations",
  },
  sso_saml: {
    name: "SSO/SAML",
    description: "Single sign-on for enterprise security",
    category: "security",
  },
  priority_support: {
    name: "Priority Support",
    description: "Faster response times for support requests",
    category: "support",
  },
  dedicated_support: {
    name: "Dedicated Support",
    description: "Dedicated account manager",
    category: "support",
  },
  advanced_analytics: {
    name: "Advanced Analytics",
    description: "Detailed business insights and reports",
    category: "analytics",
  },
  batch_processing: {
    name: "Batch Processing",
    description: "Bulk image processing and exports",
    category: "advanced",
  },
  tax_prep_export: {
    name: "Tax Prep Export",
    description: "Export data for tax preparation",
    category: "advanced",
  },
  referral_program: {
    name: "Referral Program",
    description: "Track and reward client referrals",
    category: "marketing",
  },
  review_automation: {
    name: "Review Automation",
    description: "Automated review collection and follow-ups",
    category: "marketing",
  },
  ai_assistant: {
    name: "AI Assistant",
    description: "AI-powered automation and insights",
    category: "ai",
  },
  integrations_basic: {
    name: "Basic Integrations",
    description: "Connect with Zapier, Calendly, and more",
    category: "integrations",
  },
  integrations_advanced: {
    name: "Advanced Integrations",
    description: "QuickBooks, custom API integrations",
    category: "integrations",
  },
  property_custom_domains: {
    name: "Property Custom Domains",
    description: "Purchase custom domains for property websites",
    category: "websites",
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the limit value for a specific plan and limit key
 * Returns -1 for unlimited
 */
export function getLimit(plan: PlanName, limitKey: LimitKey): LimitValue {
  return PLAN_LIMITS[plan]?.limits[limitKey] ?? PLAN_LIMITS.free.limits[limitKey];
}

/**
 * Check if a limit is unlimited (-1)
 */
export function isUnlimited(plan: PlanName, limitKey: LimitKey): boolean {
  return getLimit(plan, limitKey) === -1;
}

/**
 * Check if a feature is enabled for a plan
 */
export function hasFeature(plan: PlanName, featureKey: FeatureKey): boolean {
  return PLAN_LIMITS[plan]?.features[featureKey] ?? PLAN_LIMITS.free.features[featureKey];
}

/**
 * Check if a user has reached their limit
 * Returns { allowed: true } if under limit or unlimited
 * Returns { allowed: false, limit, current, remaining } if at or over limit
 */
export function checkLimit(
  plan: PlanName,
  limitKey: LimitKey,
  currentUsage: number
): {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
  isUnlimited: boolean;
} {
  const limit = getLimit(plan, limitKey);

  if (limit === -1) {
    return {
      allowed: true,
      limit: -1,
      current: currentUsage,
      remaining: -1,
      isUnlimited: true,
    };
  }

  const remaining = Math.max(0, limit - currentUsage);
  const allowed = currentUsage < limit;

  return {
    allowed,
    limit,
    current: currentUsage,
    remaining,
    isUnlimited: false,
  };
}

/**
 * Check if user can perform an action that would increment usage
 * Use this before creating galleries, sending emails, etc.
 */
export function canPerformAction(
  plan: PlanName,
  limitKey: LimitKey,
  currentUsage: number,
  incrementBy: number = 1
): {
  allowed: boolean;
  message?: string;
  upgradeRequired: boolean;
} {
  const limit = getLimit(plan, limitKey);

  if (limit === -1) {
    return { allowed: true, upgradeRequired: false };
  }

  const newUsage = currentUsage + incrementBy;

  if (newUsage <= limit) {
    return { allowed: true, upgradeRequired: false };
  }

  const metadata = LIMIT_METADATA[limitKey];
  const remaining = Math.max(0, limit - currentUsage);

  return {
    allowed: false,
    message: `You've reached your ${metadata.name.toLowerCase()} limit (${limit}${metadata.unit || ""}). ${remaining === 0 ? "Upgrade to continue." : `You have ${remaining} remaining.`}`,
    upgradeRequired: true,
  };
}

/**
 * Get all limits for a plan (for display in billing page)
 */
export function getPlanLimits(plan: PlanName): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

/**
 * Get limits that should be shown in billing UI
 */
export function getBillingDisplayLimits(plan: PlanName): Array<{
  key: LimitKey;
  metadata: LimitMetadata;
  value: LimitValue;
}> {
  const limits = getPlanLimits(plan);

  return Object.entries(LIMIT_METADATA)
    .filter(([, meta]) => meta.showInBilling)
    .map(([key, metadata]) => ({
      key: key as LimitKey,
      metadata,
      value: limits.limits[key as LimitKey],
    }));
}

/**
 * Format a limit value for display
 */
export function formatLimitValue(value: LimitValue, unit?: string): string {
  if (value === -1) {
    return "Unlimited";
  }
  return `${value.toLocaleString()}${unit || ""}`;
}

/**
 * Get upgrade suggestion based on current plan
 */
export function getUpgradeSuggestion(currentPlan: PlanName): {
  suggestedPlan: PlanName | null;
  message: string;
} {
  switch (currentPlan) {
    case "free":
      return {
        suggestedPlan: "pro",
        message: "Upgrade to Pro for 500GB storage, Gallery Sleep Mode, more clients, and priority support.",
      };
    case "pro":
      return {
        suggestedPlan: "studio",
        message: "Upgrade to Studio for 1TB storage, unlimited galleries, clients, invoices, white-label branding, and API access.",
      };
    case "studio":
      return {
        suggestedPlan: "enterprise",
        message: "Upgrade to Enterprise for unlimited storage (10TB included), unlimited team members, SSO, and dedicated support.",
      };
    case "enterprise":
      return {
        suggestedPlan: null,
        message: "You're on our highest plan with unlimited access. Need more storage? Add 10TB for $199/month.",
      };
    default:
      return {
        suggestedPlan: "pro",
        message: "Upgrade to unlock more features.",
      };
  }
}

/**
 * Compare two plans and return the differences
 */
export function comparePlans(
  fromPlan: PlanName,
  toPlan: PlanName
): {
  upgradedLimits: Array<{ key: LimitKey; from: LimitValue; to: LimitValue }>;
  newFeatures: FeatureKey[];
} {
  const fromLimits = PLAN_LIMITS[fromPlan];
  const toLimits = PLAN_LIMITS[toPlan];

  const upgradedLimits: Array<{ key: LimitKey; from: LimitValue; to: LimitValue }> = [];
  const newFeatures: FeatureKey[] = [];

  // Compare limits
  for (const key of Object.keys(fromLimits.limits) as LimitKey[]) {
    const fromValue = fromLimits.limits[key];
    const toValue = toLimits.limits[key];

    if (toValue > fromValue || (toValue === -1 && fromValue !== -1)) {
      upgradedLimits.push({ key, from: fromValue, to: toValue });
    }
  }

  // Compare features
  for (const key of Object.keys(fromLimits.features) as FeatureKey[]) {
    if (!fromLimits.features[key] && toLimits.features[key]) {
      newFeatures.push(key);
    }
  }

  return { upgradedLimits, newFeatures };
}

// =============================================================================
// PLAN PRICING (for reference, actual pricing in Stripe)
// =============================================================================

/**
 * Pricing structure with beta discounts and lifetime deals
 * - Beta pricing: Current promotional pricing during beta period
 * - Regular pricing: Post-beta pricing (shown as strikethrough)
 * - Lifetime: One-time payment for lifetime access
 */
export interface PlanPricing {
  name: string;
  // Monthly pricing
  monthlyBeta: number; // Current beta price
  monthlyRegular: number; // Post-beta price (for strikethrough display)
  // Annual pricing (per month equivalent)
  yearlyBeta: number; // Total annual beta price
  yearlyRegular: number; // Total annual post-beta price
  // Lifetime deal
  lifetime: number | null; // One-time payment, null if not available
  lifetimeRegular: number | null; // Post-beta lifetime price (for strikethrough)
}

export const PLAN_PRICING: Record<PlanName, PlanPricing> = {
  free: {
    name: "Free",
    monthlyBeta: 0,
    monthlyRegular: 0,
    yearlyBeta: 0,
    yearlyRegular: 0,
    lifetime: null, // No lifetime deal for free
    lifetimeRegular: null,
  },
  pro: {
    name: "Pro",
    monthlyBeta: 49,
    monthlyRegular: 79, // Post-beta: $79/mo
    yearlyBeta: 470, // ~$39/mo
    yearlyRegular: 790, // Post-beta: ~$66/mo
    lifetime: 500, // Beta LTD: $500
    lifetimeRegular: 799, // Post-beta LTD: $799
  },
  studio: {
    name: "Studio",
    monthlyBeta: 99,
    monthlyRegular: 149, // Post-beta: $149/mo
    yearlyBeta: 950, // ~$79/mo
    yearlyRegular: 1490, // Post-beta: ~$124/mo
    lifetime: 1000, // Beta LTD: $1,000
    lifetimeRegular: 1499, // Post-beta LTD: $1,499
  },
  enterprise: {
    name: "Enterprise",
    monthlyBeta: 349,
    monthlyRegular: 549, // Post-beta: $549/mo
    yearlyBeta: 3350, // ~$279/mo
    yearlyRegular: 5490, // Post-beta: ~$458/mo
    lifetime: 3500, // Beta LTD: $3,500
    lifetimeRegular: 5499, // Post-beta LTD: $5,499
  },
};

// =============================================================================
// BETA & LIFETIME DEAL SETTINGS
// =============================================================================

export const BETA_SETTINGS = {
  /** Whether beta pricing is currently active */
  isBetaActive: true,
  /** Beta period end date (for countdown display) */
  betaEndsAt: new Date("2025-06-30T23:59:59Z"),
  /** Maximum LTD slots available (null for unlimited during beta) */
  ltdSlotsTotal: 500,
  /** LTD slots remaining (would be fetched from DB in production) */
  ltdSlotsRemaining: 500,
  /** Discount percentage for in-app purchases for LTD holders */
  ltdInAppDiscount: 0.10, // 10% discount
  /** Storage add-on pricing: $199/month per 10TB (all paid plans) */
  storageAddonPrice: 199, // $199/month
  storageAddonAmount: 10000, // 10TB in GB
  /** Storage overage available per plan */
  storageOverageAvailable: {
    free: false, // Cannot purchase overage - must upgrade
    pro: true, // $199/10TB available
    studio: true, // $199/10TB available
    enterprise: true, // $199/10TB available
  } as Record<PlanName, boolean>,
};

/**
 * Lifetime Deal includes:
 * - All current and future features
 * - All modules
 * - Storage allocation per plan tier
 * - All future updates
 * - 10% discount on in-app purchases (custom domains, storage, etc.)
 */
export const LIFETIME_DEAL_INCLUDES = [
  "All current and future features",
  "All modules and updates forever",
  "Storage included with your plan tier",
  "10% discount on all in-app purchases",
  "Priority support",
  "No recurring payments ever",
] as const;

// Legacy helper for backward compatibility
export function getPlanPrice(plan: PlanName, interval: "monthly" | "yearly"): number {
  const pricing = PLAN_PRICING[plan];
  if (interval === "monthly") {
    return BETA_SETTINGS.isBetaActive ? pricing.monthlyBeta : pricing.monthlyRegular;
  }
  return BETA_SETTINGS.isBetaActive ? pricing.yearlyBeta : pricing.yearlyRegular;
}
