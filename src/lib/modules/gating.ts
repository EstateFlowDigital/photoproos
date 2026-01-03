/**
 * Module gating utilities
 *
 * Controls which features are accessible based on:
 * - Organization's selected industries
 * - Enabled modules from onboarding
 * - Subscription plan
 */

import { CORE_MODULES, MODULES, type ModuleId } from "@/lib/constants/modules";
import {
  INDUSTRIES,
  getModulesForIndustries,
  getDefaultModulesForIndustries,
} from "@/lib/constants/industries";

export interface GatingContext {
  enabledModules: string[];
  industries: string[];
  plan?: string;
}

/**
 * Check if a module is enabled for the given context
 */
export function isModuleEnabled(
  context: GatingContext,
  moduleId: string
): boolean {
  const module = MODULES[moduleId as ModuleId];

  // Unknown modules are not enabled
  if (!module) {
    return false;
  }

  // Core modules are always enabled
  if (module.isCore) {
    return true;
  }

  // Only allow modules available to the org's industries
  const availableForIndustries = getModulesForIndustries(context.industries);
  if (!availableForIndustries.includes(moduleId)) {
    return false;
  }

  // Check if explicitly enabled
  return context.enabledModules.includes(moduleId);
}

/**
 * Check if a module is available (can be enabled) based on industries
 */
export function isModuleAvailable(
  industries: string[],
  moduleId: string
): boolean {
  const module = MODULES[moduleId as ModuleId];

  if (!module) return false;

  // Core modules are always available
  if (module.isCore) return true;

  // Check if any selected industry includes this module
  const availableModules = getModulesForIndustries(industries);
  return availableModules.includes(moduleId);
}

/**
 * Get all enabled modules for a context
 */
export function getEnabledModuleIds(context: GatingContext): string[] {
  const available = getModulesForIndustries(context.industries);
  const enabled = context.enabledModules.filter((m) => available.includes(m));

  return [...CORE_MODULES, ...enabled];
}

/**
 * Get modules that are available but not enabled
 */
export function getDisabledModules(context: GatingContext): string[] {
  const available = getModulesForIndustries(context.industries);
  const enabled = getEnabledModuleIds(context);

  return available.filter((m) => !enabled.includes(m));
}

/**
 * Calculate default modules for a new organization based on industries
 */
export function calculateDefaultModules(industries: string[]): string[] {
  return getDefaultModulesForIndustries(industries);
}

/**
 * Validate that all enabled modules are available for the industries
 */
export function validateModuleSelection(
  industries: string[],
  enabledModules: string[]
): { valid: boolean; invalidModules: string[] } {
  const available = getModulesForIndustries(industries);
  const invalidModules = enabledModules.filter(
    (m) => !available.includes(m) && !CORE_MODULES.includes(m)
  );

  return {
    valid: invalidModules.length === 0,
    invalidModules,
  };
}

/**
 * Get a redirect path if user tries to access a disabled module
 */
export function getRedirectForDisabledModule(
  context: GatingContext,
  attemptedPath: string
): string | null {
  // Find which module this path belongs to
  const module = Object.values(MODULES).find((m) => {
    if (m.href === "/") return attemptedPath === "/";
    return attemptedPath.startsWith(m.href);
  });

  if (!module) return null;

  // Check if module is enabled
  if (isModuleEnabled(context, module.id)) {
    return null;
  }

  // Return redirect to dashboard
  return "/dashboard";
}

/**
 * Get navigation items filtered by enabled modules
 */
export function getFilteredNavigation(context: GatingContext) {
  const enabledIds = getEnabledModuleIds(context);

  return Object.values(MODULES)
    .filter((m) => enabledIds.includes(m.id))
    .filter((m) => m.id !== "settings") // Settings handled separately
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => ({
      id: m.id,
      label: m.name,
      href: m.href,
      icon: m.icon,
      badge: undefined as number | undefined,
    }));
}

/**
 * Get industries that would unlock a specific module
 */
export function getIndustriesForModule(moduleId: string): string[] {
  return Object.values(INDUSTRIES)
    .filter((ind) => ind.modules.includes(moduleId))
    .map((ind) => ind.id);
}

/**
 * Check if adding an industry would unlock new modules
 */
export function getNewModulesFromIndustry(
  currentIndustries: string[],
  newIndustry: string
): string[] {
  const currentModules = getModulesForIndustries(currentIndustries);
  const newModules = getModulesForIndustries([...currentIndustries, newIndustry]);

  return newModules.filter((m) => !currentModules.includes(m));
}
