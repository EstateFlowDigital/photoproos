"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  getPortfolioComments,
  approveComment,
  hideComment,
  deleteComment,
  updateCommentSettings,
  type PortfolioCommentWithMeta,
} from "@/lib/actions/portfolio-comments";

interface CommentsTabProps {
  website: {
    id: string;
    allowComments?: boolean;
    requireCommentEmail?: boolean;
  };
  isPending: boolean;
}

export function CommentsTab({ website, isPending: externalPending }: CommentsTabProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [comments, setComments] = useState<PortfolioCommentWithMeta[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "hidden">("pending");
  const [allowComments, setAllowComments] = useState(website.allowComments ?? false);
  const [requireEmail, setRequireEmail] = useState(website.requireCommentEmail ?? true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [filter, website.id]);

  async function loadComments() {
    setLoading(true);
    const result = await getPortfolioComments({
      portfolioId: website.id,
      status: filter === "all" ? "all" : filter,
    });
    if (result.success && result.comments) {
      setComments(result.comments);
    }
    setLoading(false);
  }

  function handleSaveSettings() {
    startTransition(async () => {
      const result = await updateCommentSettings(website.id, {
        allowComments,
        requireCommentEmail: requireEmail,
      });
      if (result.success) {
        showToast("Comment settings saved", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to save settings", "error");
      }
    });
  }

  function handleApprove(commentId: string) {
    startTransition(async () => {
      const result = await approveComment(commentId);
      if (result.success) {
        showToast("Comment approved", "success");
        loadComments();
      } else {
        showToast(result.error || "Failed to approve comment", "error");
      }
    });
  }

  function handleHide(commentId: string) {
    startTransition(async () => {
      const result = await hideComment(commentId);
      if (result.success) {
        showToast("Comment hidden", "success");
        loadComments();
      } else {
        showToast(result.error || "Failed to hide comment", "error");
      }
    });
  }

  function handleDelete(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    startTransition(async () => {
      const result = await deleteComment(commentId);
      if (result.success) {
        showToast("Comment deleted", "success");
        loadComments();
      } else {
        showToast(result.error || "Failed to delete comment", "error");
      }
    });
  }

  const pendingCount = comments.filter(c => !c.isApproved && !c.isHidden).length;

  return (
    <div className="space-y-6">
      {/* Settings Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Comment Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">Allow visitors to leave comments</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={requireEmail}
              onChange={(e) => setRequireEmail(e.target.checked)}
              disabled={!allowComments}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)] disabled:opacity-50"
            />
            <span className={cn("text-sm", !allowComments ? "text-foreground-muted" : "text-foreground")}>
              Require email address to comment
            </span>
          </label>
          <button
            onClick={handleSaveSettings}
            disabled={isPending || externalPending}
            className="mt-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Comments Management */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Comments
            {pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-[var(--warning)] px-2 py-0.5 text-xs font-medium text-white">
                {pendingCount} pending
              </span>
            )}
          </h3>
          <div className="flex gap-2">
            {(["pending", "approved", "hidden", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === f
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-foreground-muted">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--card-border)] py-12 text-center">
            <MessageIcon className="mx-auto h-12 w-12 text-foreground-muted" />
            <p className="mt-2 text-foreground-muted">No {filter !== "all" ? filter : ""} comments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {comment.authorName || "Anonymous"}
                      </span>
                      {comment.authorEmail && (
                        <span className="text-sm text-foreground-muted">
                          ({comment.authorEmail})
                        </span>
                      )}
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          comment.isHidden
                            ? "bg-red-500/10 text-red-400"
                            : comment.isApproved
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        )}
                      >
                        {comment.isHidden ? "Hidden" : comment.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{comment.content}</p>
                    <p className="mt-2 text-xs text-foreground-muted">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!comment.isApproved && !comment.isHidden && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        disabled={isPending}
                        className="rounded-lg bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {!comment.isHidden && (
                      <button
                        onClick={() => handleHide(comment.id)}
                        disabled={isPending}
                        className="rounded-lg bg-[var(--background-secondary)] px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground disabled:opacity-50"
                      >
                        Hide
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={isPending}
                      className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
