/**
 * Help Center Module
 *
 * Centralized exports for the Help & Support Center.
 */

// Types
export type {
  HelpCategoryId,
  HelpCategory,
  HelpArticle,
  HelpScreenshot,
  HelpFAQ,
  HelpSearchResult,
  PopularArticle,
} from "./types";

// Categories
export {
  HELP_CATEGORIES,
  getCategory,
  getCategoryBySlug,
  getCategoryLabel,
} from "./categories";

// Legacy exports from existing articles.ts (for backward compatibility)
export {
  helpCategories,
  helpArticles,
  getHelpArticle,
  getArticlesByCategory,
  getAllHelpArticles,
  getHelpCategory,
  getAllHelpCategories,
  getRelatedArticles,
  searchHelpArticles,
} from "./articles";
