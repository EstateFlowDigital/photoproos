/**
 * Industry definitions for PhotoProOS onboarding
 *
 * Each industry has associated modules and default settings.
 * Users can select multiple industries during onboarding.
 */

import {
  Building2,
  Briefcase,
  Calendar,
  User,
  UtensilsCrossed,
  Package,
  type LucideIcon,
} from "lucide-react";

export interface IndustryDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Modules available when this industry is selected */
  modules: string[];
  /** Modules enabled by default for this industry */
  defaultModules: string[];
  /** Color for UI display */
  color: string;
  /** Order in selection UI */
  sortOrder: number;
}

export const INDUSTRIES: Record<string, IndustryDefinition> = {
  real_estate: {
    id: "real_estate",
    name: "Real Estate & Property",
    description: "Residential, commercial, and architectural photography",
    icon: Building2,
    modules: [
      "galleries",
      "scheduling",
      "invoices",
      "clients",
      "leads",
      "services",
      "properties",
      "questionnaires",
      "portfolio_websites",
    ],
    defaultModules: ["galleries", "scheduling", "invoices", "clients", "leads", "properties", "questionnaires", "portfolio_websites"],
    color: "#3b82f6", // blue
    sortOrder: 1,
  },
  commercial: {
    id: "commercial",
    name: "Commercial & Corporate",
    description: "Business headshots, office spaces, products",
    icon: Briefcase,
    modules: [
      "galleries",
      "scheduling",
      "invoices",
      "clients",
      "leads",
      "services",
      "contracts",
      "portfolio_websites",
      "questionnaires",
    ],
    defaultModules: ["galleries", "scheduling", "invoices", "clients", "leads", "contracts", "portfolio_websites", "questionnaires"],
    color: "#8b5cf6", // purple
    sortOrder: 2,
  },
  events: {
    id: "events",
    name: "Events & Weddings",
    description: "Weddings, corporate events, parties",
    icon: Calendar,
    modules: [
      "galleries",
      "scheduling",
      "invoices",
      "clients",
      "leads",
      "contracts",
      "questionnaires",
      "portfolio_websites",
    ],
    defaultModules: [
      "galleries",
      "scheduling",
      "invoices",
      "clients",
      "leads",
      "contracts",
      "portfolio_websites",
      "questionnaires",
    ],
    color: "#ec4899", // pink
    sortOrder: 3,
  },
  portraits: {
    id: "portraits",
    name: "Portraits & Headshots",
    description: "Family portraits, senior photos, professional headshots",
    icon: User,
    modules: [
      "galleries",
      "scheduling",
      "invoices",
      "clients",
      "leads",
      "services",
      "mini_sessions",
      "online_booking",
      "portfolio_websites",
      "questionnaires",
    ],
    defaultModules: ["galleries", "scheduling", "invoices", "clients", "leads", "portfolio_websites", "questionnaires"],
    color: "#f97316", // orange
    sortOrder: 4,
  },
  food: {
    id: "food",
    name: "Food & Hospitality",
    description: "Restaurant, menu, and culinary photography",
    icon: UtensilsCrossed,
    modules: [
      "galleries",
      "scheduling",
      "invoices",
      "clients",
      "leads",
      "services",
      "licensing",
      "portfolio_websites",
      "questionnaires",
    ],
    defaultModules: ["galleries", "scheduling", "invoices", "clients", "leads", "portfolio_websites", "questionnaires"],
    color: "#22c55e", // green
    sortOrder: 5,
  },
  product: {
    id: "product",
    name: "Product & E-commerce",
    description: "Product shots, catalog, and e-commerce imagery",
    icon: Package,
    modules: [
      "galleries",
      "scheduling",
      "invoices",
      "clients",
      "leads",
      "services",
      "licensing",
      "batch_processing",
      "portfolio_websites",
      "product_catalogs",
      "questionnaires",
    ],
    defaultModules: ["galleries", "scheduling", "invoices", "clients", "leads", "portfolio_websites", "product_catalogs", "questionnaires"],
    color: "#06b6d4", // cyan
    sortOrder: 6,
  },
} as const;

/**
 * Get industries as sorted array for UI display
 */
export function getIndustriesArray(): IndustryDefinition[] {
  return Object.values(INDUSTRIES).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get an industry by ID
 */
export function getIndustryById(id: string): IndustryDefinition | undefined {
  return INDUSTRIES[id];
}

/**
 * Get all modules available for a set of industries
 */
export function getModulesForIndustries(industryIds: string[]): string[] {
  const moduleSet = new Set<string>();

  for (const industryId of industryIds) {
    const industry = INDUSTRIES[industryId];
    if (industry) {
      for (const module of industry.modules) {
        moduleSet.add(module);
      }
    }
  }

  return Array.from(moduleSet);
}

/**
 * Get default modules for a set of industries
 */
export function getDefaultModulesForIndustries(industryIds: string[]): string[] {
  const moduleSet = new Set<string>();

  for (const industryId of industryIds) {
    const industry = INDUSTRIES[industryId];
    if (industry) {
      for (const module of industry.defaultModules) {
        moduleSet.add(module);
      }
    }
  }

  return Array.from(moduleSet);
}

/**
 * Industry type matching Prisma enum
 */
export type IndustryId = keyof typeof INDUSTRIES;
