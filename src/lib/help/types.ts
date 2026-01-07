/**
 * Help Center Types
 *
 * Type definitions for the Help & Support Center system.
 */

// ============================================================================
// Category Types
// ============================================================================

export type HelpCategoryId =
  | "getting-started"
  | "galleries"
  | "clients"
  | "invoicing"
  | "contracts"
  | "calendar"
  | "integrations"
  | "settings";

export interface HelpCategory {
  id: HelpCategoryId;
  title: string;
  description: string;
  icon: string; // Icon name
  articleCount: number;
  slug: string;
}

// ============================================================================
// Article Types
// ============================================================================

export interface HelpArticle {
  id: string;
  slug: string;
  categoryId: HelpCategoryId;
  title: string;
  description: string;
  content: string; // Markdown content
  videoUrl?: string;
  screenshots?: HelpScreenshot[];
  relatedArticles?: string[]; // Article IDs
  faqs?: HelpFAQ[];
  tags?: string[];
  lastUpdated: string;
  readTime?: number; // Minutes
}

export interface HelpScreenshot {
  url: string;
  alt: string;
  caption?: string;
}

export interface HelpFAQ {
  question: string;
  answer: string;
}

// ============================================================================
// Search Types
// ============================================================================

export interface HelpSearchResult {
  article: HelpArticle;
  matchType: "title" | "description" | "content" | "tag";
  relevanceScore: number;
}

// ============================================================================
// Popular Articles
// ============================================================================

export interface PopularArticle {
  id: string;
  title: string;
  categoryId: HelpCategoryId;
  categoryLabel: string;
  slug: string;
}
