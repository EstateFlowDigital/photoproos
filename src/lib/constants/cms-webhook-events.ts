import type { CMSWebhookEvent } from "@prisma/client";

/**
 * Available webhook events with descriptions
 * Separated from server actions because "use server" files can only export async functions
 */
export const WEBHOOK_EVENTS: Array<{
  value: CMSWebhookEvent;
  label: string;
  description: string;
  category: string;
}> = [
  // Page events
  { value: "page_created", label: "Page Created", description: "When a new marketing page is created", category: "Pages" },
  { value: "page_updated", label: "Page Updated", description: "When a page's content is saved", category: "Pages" },
  { value: "page_published", label: "Page Published", description: "When a page goes live", category: "Pages" },
  { value: "page_unpublished", label: "Page Unpublished", description: "When a page is taken offline", category: "Pages" },
  { value: "page_deleted", label: "Page Deleted", description: "When a page is deleted", category: "Pages" },
  { value: "page_scheduled", label: "Page Scheduled", description: "When a page is scheduled for publishing", category: "Pages" },
  { value: "draft_saved", label: "Draft Saved", description: "When a draft is auto-saved", category: "Pages" },
  { value: "version_restored", label: "Version Restored", description: "When a previous version is restored", category: "Pages" },

  // FAQ events
  { value: "faq_created", label: "FAQ Created", description: "When a new FAQ is created", category: "FAQs" },
  { value: "faq_updated", label: "FAQ Updated", description: "When an FAQ is modified", category: "FAQs" },
  { value: "faq_deleted", label: "FAQ Deleted", description: "When an FAQ is deleted", category: "FAQs" },

  // Blog events
  { value: "blog_published", label: "Blog Published", description: "When a blog post goes live", category: "Blog" },
  { value: "blog_unpublished", label: "Blog Unpublished", description: "When a blog post is taken offline", category: "Blog" },

  // Approval events
  { value: "content_approved", label: "Content Approved", description: "When content is approved", category: "Workflow" },
  { value: "content_rejected", label: "Content Rejected", description: "When content is rejected", category: "Workflow" },
];
