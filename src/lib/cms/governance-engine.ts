import { db } from "@/lib/db";
import type {
  GovernancePolicyType,
  GovernanceAction,
  CMSGovernancePolicy,
} from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export type RuleSeverity = "error" | "warning" | "info";

export interface GovernanceRule {
  id?: string;
  field: string;
  check: GovernanceRuleCheck;
  value?: unknown;
  severity: RuleSeverity;
  message: string;
}

export type GovernanceRuleCheck =
  | "contains"
  | "not_contains"
  | "max_length"
  | "min_length"
  | "regex"
  | "regex_not_match"
  | "required"
  | "all_have_alt"
  | "no_empty_text"
  | "proper_hierarchy"
  | "within_days"
  | "not_weekend"
  | "business_hours"
  | "has_approver"
  | "min_word_count"
  | "max_word_count"
  | "unique_title";

export interface RuleViolation {
  ruleId?: string;
  field: string;
  message: string;
  value?: unknown;
  snippet?: string;
  severity: RuleSeverity;
}

export interface GovernanceCheckResult {
  policyId: string;
  policyName: string;
  policyType: GovernancePolicyType;
  action: GovernanceAction;
  passed: boolean;
  violations: RuleViolation[];
  severity: RuleSeverity;
}

export interface ContentToCheck {
  type: "MarketingPage" | "BlogPost" | "FAQ";
  id: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  content?: unknown;
  status?: string;
  updatedAt?: Date;
  publishedAt?: Date;
  images?: Array<{ src: string; alt?: string }>;
  links?: Array<{ href: string; text?: string }>;
  headings?: Array<{ level: number; text: string }>;
}

// ============================================================================
// RULE CHECKERS
// ============================================================================

function extractTextContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (content === null || content === undefined) return "";

  if (typeof content === "object") {
    // Recursively extract text from JSON content
    const texts: string[] = [];
    const extractFromObject = (obj: unknown): void => {
      if (typeof obj === "string") {
        texts.push(obj);
      } else if (Array.isArray(obj)) {
        obj.forEach(extractFromObject);
      } else if (obj && typeof obj === "object") {
        Object.values(obj).forEach(extractFromObject);
      }
    };
    extractFromObject(content);
    return texts.join(" ");
  }

  return String(content);
}

function getFieldValue(content: ContentToCheck, field: string): unknown {
  if (field === "content") {
    return extractTextContent(content.content);
  }
  if (field === "title") return content.title || "";
  if (field === "metaTitle") return content.metaTitle || "";
  if (field === "metaDescription") return content.metaDescription || "";
  if (field === "updatedAt") return content.updatedAt;
  if (field === "publishedAt") return content.publishedAt;
  if (field === "images") return content.images || [];
  if (field === "links") return content.links || [];
  if (field === "headings") return content.headings || [];

  // Support nested field access like "content.hero.headline"
  const parts = field.split(".");
  let value: unknown = content;
  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return value;
}

function checkContains(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const value = getFieldValue(content, rule.field);
  const text = typeof value === "string" ? value : extractTextContent(value);
  const terms = Array.isArray(rule.value) ? rule.value : [rule.value];

  for (const term of terms) {
    if (typeof term === "string" && text.toLowerCase().includes(term.toLowerCase())) {
      return null; // Contains required term, no violation
    }
  }

  return {
    field: rule.field,
    message: rule.message,
    value: rule.value,
    severity: rule.severity,
  };
}

function checkNotContains(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const value = getFieldValue(content, rule.field);
  const text = typeof value === "string" ? value : extractTextContent(value);
  const terms = Array.isArray(rule.value) ? rule.value : [rule.value];

  for (const term of terms) {
    if (typeof term === "string" && text.toLowerCase().includes(term.toLowerCase())) {
      // Find snippet around the violation
      const index = text.toLowerCase().indexOf(term.toLowerCase());
      const start = Math.max(0, index - 20);
      const end = Math.min(text.length, index + term.length + 20);
      const snippet = "..." + text.slice(start, end) + "...";

      return {
        field: rule.field,
        message: rule.message,
        value: term,
        snippet,
        severity: rule.severity,
      };
    }
  }

  return null;
}

function checkMaxLength(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const value = getFieldValue(content, rule.field);
  const text = typeof value === "string" ? value : extractTextContent(value);
  const maxLength = typeof rule.value === "number" ? rule.value : 0;

  if (text.length > maxLength) {
    return {
      field: rule.field,
      message: rule.message,
      value: `${text.length} characters (max: ${maxLength})`,
      severity: rule.severity,
    };
  }

  return null;
}

function checkMinLength(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const value = getFieldValue(content, rule.field);
  const text = typeof value === "string" ? value : extractTextContent(value);
  const minLength = typeof rule.value === "number" ? rule.value : 0;

  if (text.length < minLength) {
    return {
      field: rule.field,
      message: rule.message,
      value: `${text.length} characters (min: ${minLength})`,
      severity: rule.severity,
    };
  }

  return null;
}

function checkRegex(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const value = getFieldValue(content, rule.field);
  const text = typeof value === "string" ? value : extractTextContent(value);
  const pattern = typeof rule.value === "string" ? rule.value : "";

  try {
    const regex = new RegExp(pattern, "gi");
    if (!regex.test(text)) {
      return {
        field: rule.field,
        message: rule.message,
        severity: rule.severity,
      };
    }
  } catch {
    // Invalid regex, skip this check
  }

  return null;
}

function checkRegexNotMatch(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const value = getFieldValue(content, rule.field);
  const text = typeof value === "string" ? value : extractTextContent(value);
  const pattern = typeof rule.value === "string" ? rule.value : "";

  try {
    const regex = new RegExp(pattern, "gi");
    const match = text.match(regex);
    if (match) {
      return {
        field: rule.field,
        message: rule.message,
        value: match[0],
        severity: rule.severity,
      };
    }
  } catch {
    // Invalid regex, skip this check
  }

  return null;
}

function checkRequired(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const value = getFieldValue(content, rule.field);
  const text = typeof value === "string" ? value : extractTextContent(value);

  if (!text || text.trim().length === 0) {
    return {
      field: rule.field,
      message: rule.message,
      severity: rule.severity,
    };
  }

  return null;
}

function checkAllHaveAlt(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const images = content.images || [];

  for (const img of images) {
    if (!img.alt || img.alt.trim().length === 0) {
      return {
        field: rule.field,
        message: rule.message,
        value: img.src,
        severity: rule.severity,
      };
    }
  }

  return null;
}

function checkNoEmptyText(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const links = content.links || [];
  const genericTexts = ["click here", "read more", "learn more", "here", "link"];

  for (const link of links) {
    const text = link.text?.toLowerCase().trim() || "";
    if (!text || genericTexts.includes(text)) {
      return {
        field: rule.field,
        message: rule.message,
        value: link.text || "(empty)",
        severity: rule.severity,
      };
    }
  }

  return null;
}

function checkProperHeadingHierarchy(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const headings = content.headings || [];
  let lastLevel = 0;

  for (const heading of headings) {
    // First heading should be h1
    if (lastLevel === 0 && heading.level > 1) {
      return {
        field: rule.field,
        message: "First heading should be h1",
        value: `h${heading.level}: "${heading.text}"`,
        severity: rule.severity,
      };
    }

    // Shouldn't skip levels (e.g., h1 -> h3)
    if (heading.level > lastLevel + 1) {
      return {
        field: rule.field,
        message: rule.message,
        value: `Skipped from h${lastLevel} to h${heading.level}`,
        severity: rule.severity,
      };
    }

    lastLevel = heading.level;
  }

  return null;
}

function checkWithinDays(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const date = getFieldValue(content, rule.field) as Date | undefined;
  const maxDays = typeof rule.value === "number" ? rule.value : 90;

  if (!date) return null;

  const daysSince = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince > maxDays) {
    return {
      field: rule.field,
      message: rule.message,
      value: `${daysSince} days old (max: ${maxDays})`,
      severity: rule.severity,
    };
  }

  return null;
}

function checkNotWeekend(
  _content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const now = new Date();
  const day = now.getDay();

  if (day === 0 || day === 6) {
    return {
      field: "publishTime",
      message: rule.message,
      value: day === 0 ? "Sunday" : "Saturday",
      severity: rule.severity,
    };
  }

  return null;
}

function checkBusinessHours(
  _content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const value = rule.value as { start?: string; end?: string; timezone?: string } | undefined;
  const start = value?.start || "09:00";
  const end = value?.end || "17:00";

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  if (currentTime < start || currentTime > end) {
    return {
      field: "publishTime",
      message: rule.message,
      value: `Current time: ${currentTime} (allowed: ${start}-${end})`,
      severity: rule.severity,
    };
  }

  return null;
}

function checkMinWordCount(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const value = getFieldValue(content, rule.field);
  const text = typeof value === "string" ? value : extractTextContent(value);
  const minWords = typeof rule.value === "number" ? rule.value : 0;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount < minWords) {
    return {
      field: rule.field,
      message: rule.message,
      value: `${wordCount} words (min: ${minWords})`,
      severity: rule.severity,
    };
  }

  return null;
}

function checkMaxWordCount(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  const value = getFieldValue(content, rule.field);
  const text = typeof value === "string" ? value : extractTextContent(value);
  const maxWords = typeof rule.value === "number" ? rule.value : 0;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount > maxWords) {
    return {
      field: rule.field,
      message: rule.message,
      value: `${wordCount} words (max: ${maxWords})`,
      severity: rule.severity,
    };
  }

  return null;
}

// ============================================================================
// RULE EXECUTOR
// ============================================================================

function executeRule(
  content: ContentToCheck,
  rule: GovernanceRule
): RuleViolation | null {
  switch (rule.check) {
    case "contains":
      return checkContains(content, rule);
    case "not_contains":
      return checkNotContains(content, rule);
    case "max_length":
      return checkMaxLength(content, rule);
    case "min_length":
      return checkMinLength(content, rule);
    case "regex":
      return checkRegex(content, rule);
    case "regex_not_match":
      return checkRegexNotMatch(content, rule);
    case "required":
      return checkRequired(content, rule);
    case "all_have_alt":
      return checkAllHaveAlt(content, rule);
    case "no_empty_text":
      return checkNoEmptyText(content, rule);
    case "proper_hierarchy":
      return checkProperHeadingHierarchy(content, rule);
    case "within_days":
      return checkWithinDays(content, rule);
    case "not_weekend":
      return checkNotWeekend(content, rule);
    case "business_hours":
      return checkBusinessHours(content, rule);
    case "min_word_count":
      return checkMinWordCount(content, rule);
    case "max_word_count":
      return checkMaxWordCount(content, rule);
    default:
      return null;
  }
}

// ============================================================================
// MAIN EVALUATION FUNCTIONS
// ============================================================================

function getHighestSeverity(violations: RuleViolation[]): RuleSeverity {
  if (violations.some((v) => v.severity === "error")) return "error";
  if (violations.some((v) => v.severity === "warning")) return "warning";
  return "info";
}

/**
 * Evaluate a single policy against content
 */
export async function evaluatePolicy(
  policy: CMSGovernancePolicy,
  content: ContentToCheck
): Promise<GovernanceCheckResult> {
  const rules = (policy.rules as GovernanceRule[]) || [];
  const violations: RuleViolation[] = [];

  for (const rule of rules) {
    const violation = executeRule(content, { ...rule, id: rule.id });
    if (violation) {
      violations.push({ ...violation, ruleId: rule.id });
    }
  }

  return {
    policyId: policy.id,
    policyName: policy.name,
    policyType: policy.type,
    action: policy.action,
    passed: violations.length === 0,
    violations,
    severity: violations.length > 0 ? getHighestSeverity(violations) : "info",
  };
}

/**
 * Evaluate all applicable policies against content
 */
export async function evaluateAllPolicies(
  content: ContentToCheck
): Promise<{
  canPublish: boolean;
  results: GovernanceCheckResult[];
  errors: GovernanceCheckResult[];
  warnings: GovernanceCheckResult[];
  blockedBy: GovernanceCheckResult[];
}> {
  // Get all active policies for this content type
  const policies = await db.cMSGovernancePolicy.findMany({
    where: {
      isActive: true,
      targetTypes: {
        has: content.type,
      },
    },
    orderBy: {
      priority: "desc",
    },
  });

  const results: GovernanceCheckResult[] = [];

  // Evaluate each policy
  for (const policy of policies) {
    const result = await evaluatePolicy(policy, content);
    results.push(result);
  }

  // Categorize results
  const errors = results.filter(
    (r) => !r.passed && r.severity === "error"
  );
  const warnings = results.filter(
    (r) => !r.passed && r.severity === "warning"
  );
  const blockedBy = results.filter(
    (r) => !r.passed && r.action === "block"
  );

  return {
    canPublish: blockedBy.length === 0,
    results,
    errors,
    warnings,
    blockedBy,
  };
}

/**
 * Record a violation in the database
 */
export async function recordViolation(
  policyId: string,
  entityType: string,
  entityId: string,
  violations: RuleViolation[],
  blocked: boolean
): Promise<void> {
  const severity = getHighestSeverity(violations);

  await db.cMSGovernanceViolation.create({
    data: {
      policyId,
      entityType,
      entityId,
      violations: violations as unknown as object,
      severity,
      blocked,
    },
  });
}

/**
 * Resolve a violation
 */
export async function resolveViolation(
  violationId: string,
  userId: string,
  resolution: "fixed" | "overridden" | "dismissed",
  overrideReason?: string
): Promise<void> {
  await db.cMSGovernanceViolation.update({
    where: { id: violationId },
    data: {
      resolvedAt: new Date(),
      resolvedBy: userId,
      resolution,
      overrideReason,
    },
  });
}

/**
 * Get unresolved violations for an entity
 */
export async function getUnresolvedViolations(
  entityType: string,
  entityId: string
): Promise<Array<{
  id: string;
  policyId: string;
  violations: RuleViolation[];
  severity: string;
  blocked: boolean;
  createdAt: Date;
}>> {
  const violations = await db.cMSGovernanceViolation.findMany({
    where: {
      entityType,
      entityId,
      resolvedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return violations.map((v) => ({
    id: v.id,
    policyId: v.policyId,
    violations: v.violations as unknown as RuleViolation[],
    severity: v.severity,
    blocked: v.blocked,
    createdAt: v.createdAt,
  }));
}

// ============================================================================
// POLICY MANAGEMENT
// ============================================================================

/**
 * Get all policies
 */
export async function getAllPolicies(): Promise<CMSGovernancePolicy[]> {
  return db.cMSGovernancePolicy.findMany({
    orderBy: [{ priority: "desc" }, { name: "asc" }],
  });
}

/**
 * Get policies by type
 */
export async function getPoliciesByType(
  type: GovernancePolicyType
): Promise<CMSGovernancePolicy[]> {
  return db.cMSGovernancePolicy.findMany({
    where: { type },
    orderBy: [{ priority: "desc" }, { name: "asc" }],
  });
}

/**
 * Create a new policy
 */
export async function createPolicy(data: {
  name: string;
  description?: string;
  type: GovernancePolicyType;
  targetTypes: string[];
  rules: GovernanceRule[];
  action?: GovernanceAction;
  priority?: number;
  isActive?: boolean;
}): Promise<CMSGovernancePolicy> {
  return db.cMSGovernancePolicy.create({
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      targetTypes: data.targetTypes,
      rules: data.rules as unknown as object,
      action: data.action || "warn",
      priority: data.priority || 0,
      isActive: data.isActive ?? true,
    },
  });
}

/**
 * Update a policy
 */
export async function updatePolicy(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    type: GovernancePolicyType;
    targetTypes: string[];
    rules: GovernanceRule[];
    action: GovernanceAction;
    priority: number;
    isActive: boolean;
  }>
): Promise<CMSGovernancePolicy> {
  return db.cMSGovernancePolicy.update({
    where: { id },
    data: {
      ...data,
      rules: data.rules ? (data.rules as unknown as object) : undefined,
    },
  });
}

/**
 * Delete a policy
 */
export async function deletePolicy(id: string): Promise<void> {
  await db.cMSGovernancePolicy.delete({
    where: { id },
  });
}

/**
 * Toggle policy active status
 */
export async function togglePolicyActive(
  id: string,
  isActive: boolean
): Promise<CMSGovernancePolicy> {
  return db.cMSGovernancePolicy.update({
    where: { id },
    data: { isActive },
  });
}

// ============================================================================
// DEFAULT POLICIES
// ============================================================================

export const DEFAULT_POLICIES = {
  brandVoice: {
    name: "Brand Voice Standards",
    description: "Ensure content aligns with PhotoProOS brand guidelines",
    type: "brand_voice" as GovernancePolicyType,
    targetTypes: ["MarketingPage", "BlogPost"],
    rules: [
      {
        field: "content",
        check: "not_contains" as GovernanceRuleCheck,
        value: ["cheap", "cheapest", "best ever", "guaranteed results", "100% guaranteed"],
        severity: "error" as RuleSeverity,
        message: "Content contains banned marketing terms",
      },
      {
        field: "content",
        check: "not_contains" as GovernanceRuleCheck,
        value: ["we are the best", "number one", "industry leader", "world-class"],
        severity: "warning" as RuleSeverity,
        message: "Consider using more specific claims with evidence",
      },
    ],
    action: "warn" as GovernanceAction,
    priority: 10,
  },

  seoRequirements: {
    name: "SEO Requirements",
    description: "Ensure pages meet SEO best practices",
    type: "seo" as GovernancePolicyType,
    targetTypes: ["MarketingPage", "BlogPost"],
    rules: [
      {
        field: "metaTitle",
        check: "required" as GovernanceRuleCheck,
        severity: "error" as RuleSeverity,
        message: "Meta title is required",
      },
      {
        field: "metaTitle",
        check: "max_length" as GovernanceRuleCheck,
        value: 60,
        severity: "warning" as RuleSeverity,
        message: "Meta title should be under 60 characters for optimal display",
      },
      {
        field: "metaDescription",
        check: "required" as GovernanceRuleCheck,
        severity: "error" as RuleSeverity,
        message: "Meta description is required",
      },
      {
        field: "metaDescription",
        check: "min_length" as GovernanceRuleCheck,
        value: 120,
        severity: "warning" as RuleSeverity,
        message: "Meta description should be at least 120 characters",
      },
      {
        field: "metaDescription",
        check: "max_length" as GovernanceRuleCheck,
        value: 160,
        severity: "warning" as RuleSeverity,
        message: "Meta description should be under 160 characters",
      },
    ],
    action: "warn" as GovernanceAction,
    priority: 20,
  },

  accessibility: {
    name: "Accessibility Requirements",
    description: "Ensure content meets WCAG accessibility standards",
    type: "accessibility" as GovernancePolicyType,
    targetTypes: ["MarketingPage"],
    rules: [
      {
        field: "images",
        check: "all_have_alt" as GovernanceRuleCheck,
        severity: "error" as RuleSeverity,
        message: "All images must have alt text for screen readers",
      },
      {
        field: "links",
        check: "no_empty_text" as GovernanceRuleCheck,
        severity: "error" as RuleSeverity,
        message: "Links must have descriptive text (not 'click here' or 'read more')",
      },
      {
        field: "headings",
        check: "proper_hierarchy" as GovernanceRuleCheck,
        severity: "warning" as RuleSeverity,
        message: "Headings should follow proper hierarchy (h1 > h2 > h3)",
      },
    ],
    action: "block" as GovernanceAction,
    priority: 30,
  },

  contentFreshness: {
    name: "Content Freshness",
    description: "Monitor content age and flag outdated pages",
    type: "freshness" as GovernancePolicyType,
    targetTypes: ["MarketingPage", "BlogPost"],
    rules: [
      {
        field: "updatedAt",
        check: "within_days" as GovernanceRuleCheck,
        value: 90,
        severity: "warning" as RuleSeverity,
        message: "Content hasn't been reviewed in 90 days",
      },
      {
        field: "updatedAt",
        check: "within_days" as GovernanceRuleCheck,
        value: 180,
        severity: "error" as RuleSeverity,
        message: "Content is over 6 months old - requires review",
      },
    ],
    action: "warn" as GovernanceAction,
    priority: 5,
  },

  publishingWindows: {
    name: "Publishing Windows",
    description: "Recommend optimal publishing times",
    type: "publishing_windows" as GovernancePolicyType,
    targetTypes: ["MarketingPage", "BlogPost"],
    rules: [
      {
        field: "publishTime",
        check: "not_weekend" as GovernanceRuleCheck,
        severity: "warning" as RuleSeverity,
        message: "Publishing on weekends is not recommended for business content",
      },
      {
        field: "publishTime",
        check: "business_hours" as GovernanceRuleCheck,
        value: { start: "09:00", end: "17:00" },
        severity: "info" as RuleSeverity,
        message: "Publishing outside business hours",
      },
    ],
    action: "warn" as GovernanceAction,
    priority: 1,
  },
};

/**
 * Seed default governance policies
 */
export async function seedDefaultPolicies(): Promise<void> {
  for (const policy of Object.values(DEFAULT_POLICIES)) {
    const existing = await db.cMSGovernancePolicy.findFirst({
      where: { name: policy.name },
    });

    if (!existing) {
      await createPolicy(policy);
    }
  }
}
