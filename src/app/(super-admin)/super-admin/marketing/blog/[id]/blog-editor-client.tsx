"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateBlogPost, deleteBlogPost } from "@/lib/actions/marketing-cms";
import type { BlogPost, BlogCategory } from "@prisma/client";

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("animate-spin", className)}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

const CATEGORY_LABELS: Record<BlogCategory, string> = {
  tips: "Tips",
  tutorials: "Tutorials",
  news: "News",
  case_studies: "Case Studies",
  product_updates: "Product Updates",
  industry_insights: "Industry Insights",
};

interface Props {
  post: BlogPost;
}

export function BlogEditorClient({ post }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [content, setContent] = useState(post.content);
  const [excerpt, setExcerpt] = useState(post.excerpt || "");
  const [category, setCategory] = useState<BlogCategory>(post.category);
  const [status, setStatus] = useState<"draft" | "published" | "archived">(post.status);
  const [featuredImage, setFeaturedImage] = useState(post.featuredImage || "");
  const [metaTitle, setMetaTitle] = useState(post.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post.metaDescription || "");

  const handleSave = async () => {
    setIsSaving(true);
    startTransition(async () => {
      const result = await updateBlogPost({
        id: post.id,
        title,
        slug,
        content,
        excerpt: excerpt || null,
        category,
        status,
        featuredImage: featuredImage || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      });

      setIsSaving(false);
      if (result.success) {
        toast.success("Blog post saved");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save blog post");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deleteBlogPost(post.id);
      if (result.success) {
        toast.success("Blog post deleted");
        router.push("/super-admin/marketing/blog");
      } else {
        toast.error(result.error || "Failed to delete blog post");
      }
    });
  };

  const generateSlug = () => {
    const newSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(newSlug);
  };

  return (
    <div className="space-y-6" data-element="blog-editor-page">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap" data-element="blog-editor-header">
        <div className="flex items-center gap-4">
          <Link
            href="/super-admin/marketing/blog"
            className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors"
            data-element="blog-editor-back-btn"
          >
            <ArrowLeftIcon className="w-5 h-5 text-[var(--foreground-muted)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Edit Blog Post</h1>
            <p className="text-[var(--foreground-muted)]">
              {status === "published" ? "Published" : status === "draft" ? "Draft" : "Archived"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status === "published" && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary flex items-center gap-2"
            >
              <ExternalLinkIcon className="w-4 h-4" />
              View
            </a>
          )}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="btn btn-secondary text-red-500 hover:bg-red-500/10 flex items-center gap-2"
            data-element="blog-editor-delete-btn"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || isSaving}
            className="btn btn-primary flex items-center gap-2"
            data-element="blog-editor-save-btn"
          >
            {isSaving ? (
              <LoaderIcon className="w-4 h-4" />
            ) : (
              <SaveIcon className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog post title..."
              className="w-full px-4 py-3 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)] text-lg placeholder:text-[var(--foreground-muted)]"
              data-element="blog-editor-title"
            />
          </div>

          {/* Content */}
          <div className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <label htmlFor="content" className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here..."
              rows={20}
              className="w-full px-4 py-3 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] font-mono text-sm resize-y"
              data-element="blog-editor-content"
            />
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">
              Supports Markdown formatting
            </p>
          </div>

          {/* Excerpt */}
          <div className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <label htmlFor="excerpt" className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
              data-element="blog-editor-excerpt"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Category */}
          <div className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)] space-y-4">
            <h3 className="font-medium text-[var(--foreground)]">Publish Settings</h3>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                data-element="blog-editor-status"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as BlogCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                data-element="blog-editor-category"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Slug */}
          <div className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)] space-y-4">
            <h3 className="font-medium text-[var(--foreground)]">URL Slug</h3>
            <div className="flex gap-2">
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                data-element="blog-editor-slug"
              />
              <button
                onClick={generateSlug}
                className="px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                title="Generate from title"
              >
                Auto
              </button>
            </div>
            <p className="text-xs text-[var(--foreground-muted)]">
              /blog/{slug || "..."}
            </p>
          </div>

          {/* Featured Image */}
          <div className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)] space-y-4">
            <h3 className="font-medium text-[var(--foreground)]">Featured Image</h3>
            <input
              id="featuredImage"
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
              data-element="blog-editor-featured-image"
            />
            {featuredImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--background-tertiary)]">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)] space-y-4">
            <h3 className="font-medium text-[var(--foreground)]">SEO Settings</h3>
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                Meta Title
              </label>
              <input
                id="metaTitle"
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || "Page title..."}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                data-element="blog-editor-meta-title"
              />
            </div>
            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief description for search engines..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                data-element="blog-editor-meta-description"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)] space-y-3">
            <h3 className="font-medium text-[var(--foreground)]">Statistics</h3>
            <div className="text-sm text-[var(--foreground-muted)] space-y-2">
              <div className="flex justify-between">
                <span>Views</span>
                <span className="text-[var(--foreground)]">{post.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-[var(--foreground)]">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span className="text-[var(--foreground)]">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </span>
              </div>
              {post.publishedAt && (
                <div className="flex justify-between">
                  <span>Published</span>
                  <span className="text-[var(--foreground)]">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
