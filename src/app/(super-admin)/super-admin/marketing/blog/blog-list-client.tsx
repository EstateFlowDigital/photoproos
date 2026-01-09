"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { deleteBlogPost, createBlogPost } from "@/lib/actions/marketing-cms";
import type { BlogPost, BlogCategory } from "@prisma/client";

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
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

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
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
  posts: BlogPost[];
}

export function BlogListClient({ posts = [] }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<BlogCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Ensure posts is always an array
  const safePosts = Array.isArray(posts) ? posts : [];

  const filteredPosts = safePosts.filter((post) => {
    if (filter !== "all" && post.category !== filter) return false;
    if (statusFilter !== "all" && post.status !== statusFilter) return false;
    return true;
  });

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    startTransition(async () => {
      const result = await deleteBlogPost(id);
      if (result.success) {
        toast.success("Blog post deleted");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete blog post");
      }
    });
  };

  const handleCreateNew = () => {
    startTransition(async () => {
      const result = await createBlogPost({
        title: "Untitled Post",
        slug: `untitled-${Date.now()}`,
        content: "Start writing your blog post here...",
        category: "tips",
        status: "draft",
      });
      if (result.success) {
        router.push(`/super-admin/marketing/blog/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to create blog post");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/super-admin/marketing"
            className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-[var(--foreground-muted)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Blog Posts</h1>
            <p className="text-[var(--foreground-muted)]">
              {safePosts.length} posts total
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateNew}
          disabled={isPending}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--foreground-muted)]">Category:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as BlogCategory | "all")}
            className="px-3 py-1.5 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)] text-sm"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--foreground-muted)]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
            className="px-3 py-1.5 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)] text-sm"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--card)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">
                Title
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">
                Category
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">
                Views
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">
                Date
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[var(--foreground-muted)]">
                  No blog posts found
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-[var(--background-elevated)]">
                  <td className="px-4 py-3">
                    <div>
                      <Link
                        href={`/super-admin/marketing/blog/${post.id}`}
                        className="font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                      >
                        {post.title}
                      </Link>
                      <p className="text-sm text-[var(--foreground-muted)]">/{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm px-2 py-1 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">
                      {CATEGORY_LABELS[post.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        post.status === "published"
                          ? "bg-green-500/10 text-green-500"
                          : post.status === "draft"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-gray-500/10 text-gray-500"
                      )}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground-muted)]">
                    {post.viewCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground-muted)]">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === "published" && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
                          title="View post"
                        >
                          <ExternalLinkIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
                        </a>
                      )}
                      <Link
                        href={`/super-admin/marketing/blog/${post.id}`}
                        className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
                        title="Edit post"
                      >
                        <EditIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={isPending}
                        className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete post"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
