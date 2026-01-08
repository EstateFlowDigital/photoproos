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
      storage_gb: 2,
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
  // ===========================================================================
  pro: {
    limits: {
      // Storage & Files
      storage_gb: 50,
      galleries_active: -1, // Unlimited
      photos_per_gallery: 500,
      // Clients & CRM
      clients_total: -1,
      leads_total: -1,
      // Team
      team_members: 3,
      // Billing
      invoices_per_month: -1,
      contracts_per_month: -1,
      estimates_per_month: -1,
      // Communication
      emails_per_month: 500,
      sms_per_month: 50,
      email_accounts_synced: 2,
      // AI & Advanced
      ai_credits_per_month: 100,
      marketing_generations_per_month: 25,
      // Properties & Websites
      properties_active: 25,
      portfolio_websites: 3,
      custom_domains: 1,
      // Scheduling
      bookings_per_month: -1,
      booking_types: 10,
      // Other
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
      api_access: true,
      webhooks: true,
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
  // STUDIO PLAN - $99/mo - For established studios
  // ===========================================================================
  studio: {
    limits: {
      // Storage & Files
      storage_gb: 500,
      galleries_active: -1,
      photos_per_gallery: -1,
      // Clients & CRM
      clients_total: -1,
      leads_total: -1,
      // Team
      team_members: 10,
      // Billing
      invoices_per_month: -1,
      contracts_per_month: -1,
      estimates_per_month: -1,
      // Communication
      emails_per_month: 2000,
      sms_per_month: 200,
      email_accounts_synced: 5,
      // AI & Advanced
      ai_credits_per_month: 500,
      marketing_generations_per_month: 100,
      // Properties & Websites
      properties_active: 100,
      portfolio_websites: 10,
      custom_domains: 5,
      // Scheduling
      bookings_per_month: -1,
      booking_types: -1,
      // Other
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
  // ENTERPRISE PLAN - $249/mo - For agencies & large teams
  // ===========================================================================
  enterprise: {
    limits: {
      // Everything unlimited
      storage_gb: -1,
      galleries_active: -1,
      photos_per_gallery: -1,
      clients_total: -1,
      leads_total: -1,
      team_members: -1,
      invoices_per_month: -1,
      contracts_per_month: -1,
      estimates_per_month: -1,
      emails_per_month: -1,
      sms_per_month: -1,
      email_accounts_synced: -1,
      ai_credits_per_month: -1,
      marketing_generations_per_month: -1,
      properties_active: -1,
      portfolio_websites: -1,
      custom_domains: -1,
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
      sso_saml: true,
      priority_support: true,
      dedicated_support: true,
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
        message: "Upgrade to Pro for unlimited galleries, more storage, and priority support.",
      };
    case "pro":
      return {
        suggestedPlan: "studio",
        message: "Upgrade to Studio for white-label branding, more team members, and advanced analytics.",
      };
    case "studio":
      return {
        suggestedPlan: "enterprise",
        message: "Upgrade to Enterprise for unlimited everything, SSO, and dedicated support.",
      };
    case "enterprise":
      return {
        suggestedPlan: null,
        message: "You're on our highest plan with unlimited access.",
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

export const PLAN_PRICING: Record<PlanName, { monthly: number; yearly: number; name: string }> = {
  free: { monthly: 0, yearly: 0, name: "Free" },
  pro: { monthly: 49, yearly: 470, name: "Pro" },
  studio: { monthly: 99, yearly: 950, name: "Studio" },
  enterprise: { monthly: 249, yearly: 2390, name: "Enterprise" },
};
