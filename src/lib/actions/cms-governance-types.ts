/**
 * CMS Governance Types
 *
 * Type definitions for CMS governance checks.
 * These are separated from the main cms-governance.ts server actions file
 * because "use server" files require all exports to be async functions.
 */

export type { ContentToCheck, GovernanceCheckResult, GovernanceRule, RuleViolation } from "@/lib/cms/governance-engine";
