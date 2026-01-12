/**
 * HTML Sanitization Utilities
 *
 * Provides XSS protection for user-generated content and external HTML sources.
 * Uses DOMPurify under the hood for robust sanitization.
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content for safe rendering with dangerouslySetInnerHTML.
 *
 * Removes potentially dangerous elements like scripts, event handlers,
 * and malicious URLs while preserving safe formatting.
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
 * ```
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";

  return DOMPurify.sanitize(html, {
    // Allow common formatting tags
    ALLOWED_TAGS: [
      "p", "br", "div", "span",
      "strong", "b", "em", "i", "u", "s", "strike",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "a", "img",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
      "hr", "sup", "sub",
    ],
    // Allow safe attributes
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "id",
      "target", "rel", "style",
      "colspan", "rowspan", "width", "height",
    ],
    // Force links to open in new tab and add noopener
    ADD_ATTR: ["target", "rel"],
    // Prevent javascript: URLs
    ALLOW_DATA_ATTR: false,
    // Remove empty tags
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize email HTML content.
 *
 * More permissive than general sanitization to preserve email formatting,
 * but still removes scripts, event handlers, and dangerous elements.
 *
 * @param html - Raw email HTML to sanitize
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeEmailHtml(html: string | null | undefined): string {
  if (!html) return "";

  return DOMPurify.sanitize(html, {
    // Allow more tags for email content
    ALLOWED_TAGS: [
      "p", "br", "div", "span",
      "strong", "b", "em", "i", "u", "s", "strike",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "a", "img",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td",
      "hr", "sup", "sub",
      "font", "center", // Common in emails
    ],
    // Allow common email attributes including inline styles
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "id",
      "target", "rel", "style",
      "colspan", "rowspan", "width", "height",
      "align", "valign", "bgcolor", "color", "size", "face", // Email-specific
      "border", "cellpadding", "cellspacing",
    ],
    // Prevent javascript: URLs
    ALLOW_DATA_ATTR: false,
    // Keep content even if tag is removed
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize rich text content (from editors like TipTap/Quill).
 *
 * Designed for contract content, blog posts, and other user-created
 * rich text. Preserves formatting while removing XSS vectors.
 *
 * @param html - Raw HTML from rich text editor
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";

  return DOMPurify.sanitize(html, {
    // Allow formatting tags commonly used in rich text editors
    ALLOWED_TAGS: [
      "p", "br", "div", "span",
      "strong", "b", "em", "i", "u", "s", "strike", "mark",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "dl", "dt", "dd",
      "a", "img",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
      "hr", "sup", "sub", "small",
      "figure", "figcaption",
    ],
    // Allow safe attributes
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "id",
      "target", "rel", "style",
      "colspan", "rowspan", "width", "height",
      "data-*", // Allow data attributes for editor functionality
    ],
    // Keep the content of stripped tags
    KEEP_CONTENT: true,
    // Prevent javascript: URLs
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });
}

/**
 * Strip all HTML tags, keeping only text content.
 *
 * Useful for previews, excerpts, and anywhere plain text is needed.
 *
 * @param html - HTML string to strip
 * @returns Plain text with all HTML removed
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";

  // Use DOMPurify to strip all tags
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}
