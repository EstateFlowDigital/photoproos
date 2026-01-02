/**
 * Module definitions for Dovetail feature gating
 *
 * Modules are features that can be enabled/disabled based on:
 * - Industry selection during onboarding
 * - User preferences in settings
 * - Subscription plan
 */

import {
  LayoutDashboard,
  Images,
  Calendar,
  Users,
  FileText,
  Tag,
  Building2,
  FileSignature,
  ClipboardList,
  Camera,
  Globe,
  Scale,
  Layers,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Route path for this module */
  href: string;
  /** Whether this module is always enabled (core module) */
  isCore: boolean;
  /** Industries that include this module */
  industries: string[];
  /** Category for grouping in UI */
  category: "core" | "operations" | "client" | "advanced";
  /** Order within category */
  sortOrder: number;
}

export const MODULES: Record<string, ModuleDefinition> = {
  // ============================================================================
  // CORE MODULES (Always Enabled)
  // ============================================================================
  dashboard: {
    id: "dashboard",
    name: "Dashboard",
    description: "Overview of your business metrics and activity",
    icon: LayoutDashboard,
    href: "/",
    isCore: true,
    industries: ["*"],
    category: "core",
    sortOrder: 1,
  },
  settings: {
    id: "settings",
    name: "Settings",
    description: "Account and organization settings",
    icon: Settings,
    href: "/settings",
    isCore: true,
    industries: ["*"],
    category: "core",
    sortOrder: 99,
  },

  // ============================================================================
  // OPERATIONS MODULES
  // ============================================================================
  galleries: {
    id: "galleries",
    name: "Galleries",
    description: "Photo delivery and client viewing",
    icon: Images,
    href: "/galleries",
    isCore: false,
    industries: ["real_estate", "commercial", "events", "portraits", "food", "product"],
    category: "operations",
    sortOrder: 2,
  },
  scheduling: {
    id: "scheduling",
    name: "Scheduling",
    description: "Booking calendar and appointments",
    icon: Calendar,
    href: "/scheduling",
    isCore: false,
    industries: ["real_estate", "commercial", "events", "portraits", "food", "product"],
    category: "operations",
    sortOrder: 3,
  },
  invoices: {
    id: "invoices",
    name: "Invoices",
    description: "Billing and payment collection",
    icon: FileText,
    href: "/invoices",
    isCore: false,
    industries: ["real_estate", "commercial", "events", "portraits", "food", "product"],
    category: "operations",
    sortOrder: 4,
  },
  services: {
    id: "services",
    name: "Services",
    description: "Photography packages and pricing",
    icon: Tag,
    href: "/services",
    isCore: false,
    industries: ["real_estate", "commercial", "events", "portraits", "food", "product"],
    category: "operations",
    sortOrder: 5,
  },

  // ============================================================================
  // CLIENT MODULES
  // ============================================================================
  clients: {
    id: "clients",
    name: "Clients",
    description: "Contact management and CRM",
    icon: Users,
    href: "/clients",
    isCore: false,
    industries: ["real_estate", "commercial", "events", "portraits", "food", "product"],
    category: "client",
    sortOrder: 6,
  },
  contracts: {
    id: "contracts",
    name: "Contracts",
    description: "Digital contracts and e-signatures",
    icon: FileSignature,
    href: "/contracts",
    isCore: false,
    industries: ["commercial", "events"],
    category: "client",
    sortOrder: 7,
  },
  questionnaires: {
    id: "questionnaires",
    name: "Questionnaires",
    description: "Client intake and event details",
    icon: ClipboardList,
    href: "/questionnaires",
    isCore: false,
    industries: ["events"],
    category: "client",
    sortOrder: 8,
  },

  // ============================================================================
  // INDUSTRY-SPECIFIC MODULES
  // ============================================================================
  properties: {
    id: "properties",
    name: "Properties",
    description: "Real estate property management",
    icon: Building2,
    href: "/properties",
    isCore: false,
    industries: ["real_estate"],
    category: "advanced",
    sortOrder: 10,
  },
  mini_sessions: {
    id: "mini_sessions",
    name: "Mini Sessions",
    description: "High-volume mini session events",
    icon: Camera,
    href: "/mini-sessions",
    isCore: false,
    industries: ["portraits"],
    category: "advanced",
    sortOrder: 11,
  },
  online_booking: {
    id: "online_booking",
    name: "Online Booking",
    description: "Client self-scheduling portal",
    icon: Globe,
    href: "/booking",
    isCore: false,
    industries: ["portraits"],
    category: "advanced",
    sortOrder: 12,
  },
  licensing: {
    id: "licensing",
    name: "Licensing",
    description: "Image usage rights management",
    icon: Scale,
    href: "/licensing",
    isCore: false,
    industries: ["food", "product", "commercial"],
    category: "advanced",
    sortOrder: 13,
  },
  batch_processing: {
    id: "batch_processing",
    name: "Batch Processing",
    description: "Bulk image processing and export",
    icon: Layers,
    href: "/batch",
    isCore: false,
    industries: ["product"],
    category: "advanced",
    sortOrder: 14,
  },
} as const;

/**
 * Core modules that are always enabled
 */
export const CORE_MODULES = Object.values(MODULES)
  .filter((m) => m.isCore)
  .map((m) => m.id);

/**
 * Get all modules as sorted array
 */
export function getModulesArray(): ModuleDefinition[] {
  return Object.values(MODULES).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get modules grouped by category
 */
export function getModulesByCategory(): Record<string, ModuleDefinition[]> {
  const result: Record<string, ModuleDefinition[]> = {
    core: [],
    operations: [],
    client: [],
    advanced: [],
  };

  for (const module of getModulesArray()) {
    result[module.category].push(module);
  }

  return result;
}

/**
 * Get a module by ID
 */
export function getModuleById(id: string): ModuleDefinition | undefined {
  return MODULES[id];
}

/**
 * Check if a module is enabled for an organization
 */
export function isModuleEnabled(
  enabledModules: string[],
  moduleId: string
): boolean {
  const module = MODULES[moduleId];

  // Core modules are always enabled
  if (module?.isCore) return true;

  // Check if explicitly enabled
  return enabledModules.includes(moduleId);
}

/**
 * Get enabled modules with their definitions
 */
export function getEnabledModules(
  enabledModuleIds: string[]
): ModuleDefinition[] {
  return getModulesArray().filter(
    (m) => m.isCore || enabledModuleIds.includes(m.id)
  );
}

/**
 * Get navigation items for enabled modules
 */
export function getNavigationItems(enabledModuleIds: string[]) {
  return getEnabledModules(enabledModuleIds)
    .filter((m) => m.id !== "settings") // Settings is handled separately
    .map((m) => ({
      id: m.id,
      label: m.name,
      href: m.href,
      icon: m.icon,
    }));
}

/**
 * Module type
 */
export type ModuleId = keyof typeof MODULES;
