/**
 * Content Validation Utilities for CMS
 *
 * Provides validation rules, checks, and utilities for ensuring
 * content quality across marketing pages.
 */

// Validation severity levels
export type ValidationSeverity = "error" | "warning" | "info";

// Validation result
export interface ValidationResult {
  id: string;
  field: string;
  message: string;
  severity: ValidationSeverity;
  value?: unknown;
  suggestion?: string;
}

// Validation rule definition
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: ValidationSeverity;
  validate: (content: Record<string, unknown>, context: ValidationContext) => ValidationResult | null;
}

// Context for validation
export interface ValidationContext {
  slug: string;
  pageType: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

/**
 * Built-in validation rules
 */
export const VALIDATION_RULES: ValidationRule[] = [
  // Required Fields
  {
    id: "required-hero",
    name: "Hero Section Required",
    description: "Pages should have a hero section with headline",
    severity: "error",
    validate: (content) => {
      const hero = content.hero as Record<string, unknown> | undefined;
      if (!hero || !hero.headline) {
        return {
          id: "required-hero",
          field: "hero.headline",
          message: "Missing hero headline",
          severity: "error",
          suggestion: "Add a compelling headline to the hero section",
        };
      }
      return null;
    },
  },

  // Meta Title Length
  {
    id: "meta-title-length",
    name: "Meta Title Length",
    description: "Meta title should be 30-60 characters",
    severity: "warning",
    validate: (_, context) => {
      const length = context.metaTitle?.length || 0;
      if (length === 0) {
        return {
          id: "meta-title-length",
          field: "metaTitle",
          message: "Missing meta title",
          severity: "error",
          value: 0,
          suggestion: "Add a meta title between 30-60 characters",
        };
      }
      if (length < 30) {
        return {
          id: "meta-title-length",
          field: "metaTitle",
          message: `Meta title too short (${length} chars)`,
          severity: "warning",
          value: length,
          suggestion: `Add ${30 - length} more characters`,
        };
      }
      if (length > 60) {
        return {
          id: "meta-title-length",
          field: "metaTitle",
          message: `Meta title too long (${length} chars)`,
          severity: "warning",
          value: length,
          suggestion: `Remove ${length - 60} characters to prevent truncation`,
        };
      }
      return null;
    },
  },

  // Meta Description Length
  {
    id: "meta-description-length",
    name: "Meta Description Length",
    description: "Meta description should be 120-160 characters",
    severity: "warning",
    validate: (_, context) => {
      const length = context.metaDescription?.length || 0;
      if (length === 0) {
        return {
          id: "meta-description-length",
          field: "metaDescription",
          message: "Missing meta description",
          severity: "error",
          value: 0,
          suggestion: "Add a meta description between 120-160 characters",
        };
      }
      if (length < 120) {
        return {
          id: "meta-description-length",
          field: "metaDescription",
          message: `Meta description too short (${length} chars)`,
          severity: "warning",
          value: length,
          suggestion: `Add ${120 - length} more characters for better CTR`,
        };
      }
      if (length > 160) {
        return {
          id: "meta-description-length",
          field: "metaDescription",
          message: `Meta description too long (${length} chars)`,
          severity: "warning",
          value: length,
          suggestion: `Remove ${length - 160} characters to prevent truncation`,
        };
      }
      return null;
    },
  },

  // OG Image Present
  {
    id: "og-image-present",
    name: "Open Graph Image",
    description: "Pages should have an OG image for social sharing",
    severity: "warning",
    validate: (_, context) => {
      if (!context.ogImage) {
        return {
          id: "og-image-present",
          field: "ogImage",
          message: "Missing Open Graph image",
          severity: "warning",
          suggestion: "Add an OG image (1200x630px recommended) for better social sharing",
        };
      }
      return null;
    },
  },

  // Empty Sections
  {
    id: "empty-sections",
    name: "Empty Sections Check",
    description: "Content sections should not be empty",
    severity: "warning",
    validate: (content) => {
      const emptyKeys: string[] = [];

      for (const [key, value] of Object.entries(content)) {
        if (value === null || value === undefined) {
          emptyKeys.push(key);
        } else if (typeof value === "string" && value.trim() === "") {
          emptyKeys.push(key);
        } else if (Array.isArray(value) && value.length === 0) {
          emptyKeys.push(key);
        } else if (typeof value === "object" && Object.keys(value as object).length === 0) {
          emptyKeys.push(key);
        }
      }

      if (emptyKeys.length > 0) {
        return {
          id: "empty-sections",
          field: emptyKeys.join(", "),
          message: `Empty sections: ${emptyKeys.join(", ")}`,
          severity: "warning",
          value: emptyKeys.length,
          suggestion: "Fill in or remove empty content sections",
        };
      }
      return null;
    },
  },

  // CTA Present
  {
    id: "cta-present",
    name: "Call to Action",
    description: "Marketing pages should have a clear CTA",
    severity: "info",
    validate: (content, context) => {
      // Skip for legal pages
      if (context.pageType === "legal") return null;

      const hero = content.hero as Record<string, unknown> | undefined;
      const hasCta = hero?.cta || hero?.ctaText || content.cta;

      if (!hasCta) {
        return {
          id: "cta-present",
          field: "cta",
          message: "No clear call-to-action found",
          severity: "info",
          suggestion: "Add a CTA button to guide visitors to convert",
        };
      }
      return null;
    },
  },

  // Banned Words Check
  {
    id: "banned-words",
    name: "Brand Voice Check",
    description: "Content should not contain banned marketing terms",
    severity: "warning",
    validate: (content) => {
      const BANNED_WORDS = [
        "100% guaranteed",
        "best ever",
        "cheapest",
        "no risk",
        "act now",
        "limited time only",
        "once in a lifetime",
        "you won't believe",
      ];

      const contentStr = JSON.stringify(content).toLowerCase();
      const foundBanned = BANNED_WORDS.filter(word =>
        contentStr.includes(word.toLowerCase())
      );

      if (foundBanned.length > 0) {
        return {
          id: "banned-words",
          field: "content",
          message: `Contains banned terms: "${foundBanned.join('", "')}"`,
          severity: "warning",
          value: foundBanned.length,
          suggestion: "Use more professional, credible language",
        };
      }
      return null;
    },
  },

  // URL Structure
  {
    id: "url-structure",
    name: "URL Structure",
    description: "URLs should be clean and SEO-friendly",
    severity: "warning",
    validate: (_, context) => {
      const issues: string[] = [];
      const { slug } = context;

      if (slug.includes("_")) issues.push("contains underscores (use hyphens)");
      if (slug.includes(" ")) issues.push("contains spaces");
      if (/[A-Z]/.test(slug)) issues.push("contains uppercase");
      if (slug.length > 75) issues.push("too long (max 75 chars)");
      if (/[^a-z0-9\-/]/.test(slug)) issues.push("contains special characters");

      if (issues.length > 0) {
        return {
          id: "url-structure",
          field: "slug",
          message: `URL issues: ${issues.join(", ")}`,
          severity: "warning",
          suggestion: "Use lowercase letters, numbers, and hyphens only",
        };
      }
      return null;
    },
  },

  // Content Depth
  {
    id: "content-depth",
    name: "Content Depth",
    description: "Pages should have sufficient content",
    severity: "info",
    validate: (content, context) => {
      // Skip for certain page types
      if (["legal", "contact"].includes(context.pageType)) return null;

      const contentStr = JSON.stringify(content);
      const wordCount = contentStr.split(/\s+/).length;

      if (wordCount < 50) {
        return {
          id: "content-depth",
          field: "content",
          message: `Very limited content (~${wordCount} words)`,
          severity: "warning",
          value: wordCount,
          suggestion: "Add more descriptive content for better SEO and user experience",
        };
      }
      if (wordCount < 100) {
        return {
          id: "content-depth",
          field: "content",
          message: `Limited content (~${wordCount} words)`,
          severity: "info",
          value: wordCount,
          suggestion: "Consider adding more content to improve engagement",
        };
      }
      return null;
    },
  },

  // Accessibility: Image Alt Text
  {
    id: "image-alt-text",
    name: "Image Alt Text",
    description: "Images should have alt text for accessibility",
    severity: "warning",
    validate: (content) => {
      const checkForMissingAlt = (obj: unknown, path = ""): string[] => {
        const missing: string[] = [];

        if (typeof obj !== "object" || obj === null) return missing;

        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;

          // Check if this looks like an image field
          if (
            (key.toLowerCase().includes("image") ||
             key.toLowerCase().includes("img") ||
             key.toLowerCase().includes("photo")) &&
            typeof value === "string" &&
            value.startsWith("http")
          ) {
            // Check for corresponding alt field
            const altKey = key.replace(/image|img|photo/i, "alt");
            const objTyped = obj as Record<string, unknown>;
            if (!objTyped[altKey] && !objTyped[`${key}Alt`] && !objTyped.alt) {
              missing.push(currentPath);
            }
          }

          // Recurse
          if (typeof value === "object") {
            missing.push(...checkForMissingAlt(value, currentPath));
          }
        }

        return missing;
      };

      const missingAlt = checkForMissingAlt(content);

      if (missingAlt.length > 0) {
        return {
          id: "image-alt-text",
          field: missingAlt.join(", "),
          message: `${missingAlt.length} image(s) may be missing alt text`,
          severity: "warning",
          value: missingAlt.length,
          suggestion: "Add descriptive alt text for all images (accessibility requirement)",
        };
      }
      return null;
    },
  },
];

/**
 * Validate content against all rules
 */
export function validateContent(
  content: Record<string, unknown>,
  context: ValidationContext,
  rules: ValidationRule[] = VALIDATION_RULES
): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const rule of rules) {
    const result = rule.validate(content, context);
    if (result) {
      results.push(result);
    }
  }

  // Sort by severity: error > warning > info
  const severityOrder: Record<ValidationSeverity, number> = {
    error: 0,
    warning: 1,
    info: 2,
  };

  return results.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/**
 * Get validation summary
 */
export function getValidationSummary(results: ValidationResult[]) {
  const errors = results.filter(r => r.severity === "error");
  const warnings = results.filter(r => r.severity === "warning");
  const info = results.filter(r => r.severity === "info");

  return {
    total: results.length,
    errors: errors.length,
    warnings: warnings.length,
    info: info.length,
    isValid: errors.length === 0,
    hasIssues: results.length > 0,
  };
}

/**
 * Check if content is ready to publish
 */
export function isReadyToPublish(
  content: Record<string, unknown>,
  context: ValidationContext
): { ready: boolean; blockers: ValidationResult[] } {
  const results = validateContent(content, context);
  const blockers = results.filter(r => r.severity === "error");

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

/**
 * Quick content quality score (0-100)
 */
export function getContentQualityScore(
  content: Record<string, unknown>,
  context: ValidationContext
): number {
  const results = validateContent(content, context);
  const summary = getValidationSummary(results);

  const totalChecks = VALIDATION_RULES.length;
  const passedChecks = totalChecks - summary.total;

  // Score calculation: passed = 100%, warnings = 50%, errors = 0%, info = 75%
  let score = (passedChecks / totalChecks) * 100;

  // Deductions
  score -= summary.errors * 15;
  score -= summary.warnings * 5;
  score -= summary.info * 2;

  return Math.max(0, Math.min(100, Math.round(score)));
}
