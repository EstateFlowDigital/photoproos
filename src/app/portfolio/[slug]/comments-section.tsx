"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, User, Loader2 } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  sectionId: string | null;
  projectId: string | null;
  authorName: string | null;
  createdAt: string;
}

interface CommentsSectionProps {
  slug: string;
  requireEmail: boolean;
  primaryColor?: string | null;
  sectionId?: string;
  projectId?: string;
}

export function CommentsSection({
  slug,
  requireEmail,
  primaryColor,
  sectionId,
  projectId,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const accentColor = primaryColor || "#3b82f6";

  useEffect(() => {
    fetchComments();
  }, [slug, sectionId, projectId]);

  async function fetchComments() {
    try {
      const params = new URLSearchParams({ slug });
      if (sectionId) params.set("sectionId", sectionId);
      if (projectId) params.set("projectId", projectId);

      const response = await fetch(`/api/portfolio/comments?${params}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const response = await fetch("/api/portfolio/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          content,
          sectionId,
          projectId,
          authorName: authorName || undefined,
          authorEmail: authorEmail || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setContent("");
        setShowForm(false);
      } else {
        setError(data.error || "Failed to submit comment");
      }
    } catch (err) {
      setError("Failed to submit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="comments-section">
      <style jsx>{`
        .comments-section {
          padding: 2rem 0;
        }
        .comments-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .comments-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: inherit;
        }
        .comments-count {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: normal;
        }
        .add-comment-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: ${accentColor};
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .add-comment-btn:hover {
          opacity: 0.9;
        }
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .comment-card {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
        }
        .comment-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .comment-avatar {
          width: 2rem;
          height: 2rem;
          background: ${accentColor}20;
          color: ${accentColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .comment-author {
          font-weight: 500;
          font-size: 0.875rem;
        }
        .comment-date {
          color: #6b7280;
          font-size: 0.75rem;
        }
        .comment-content {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: inherit;
        }
        .comment-form {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 0.75rem;
          padding: 1.25rem;
          margin-top: 1rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: inherit;
        }
        .form-label .required {
          color: #ef4444;
        }
        .form-input {
          padding: 0.625rem 0.875rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          font-size: 0.9375rem;
          background: white;
          color: #1f2937;
        }
        .form-input:focus {
          outline: none;
          border-color: ${accentColor};
          box-shadow: 0 0 0 3px ${accentColor}20;
        }
        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }
        .form-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 1rem;
        }
        .submit-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: ${accentColor};
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .cancel-btn {
          padding: 0.625rem 1rem;
          background: transparent;
          color: #6b7280;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .cancel-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        .message {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .message.error {
          background: #fee2e2;
          color: #b91c1c;
        }
        .message.success {
          background: #dcfce7;
          color: #166534;
        }
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }
        .loading {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }
      `}</style>

      <div className="comments-header">
        <h3 className="comments-title">
          <MessageSquare size={20} />
          Comments
          {comments.length > 0 && (
            <span className="comments-count">({comments.length})</span>
          )}
        </h3>
        {!showForm && (
          <button className="add-comment-btn" onClick={() => setShowForm(true)}>
            <MessageSquare size={16} />
            Leave a Comment
          </button>
        )}
      </div>

      {success && (
        <div className="message success">
          Thank you! Your comment has been submitted and is awaiting approval.
        </div>
      )}

      {error && <div className="message error">{error}</div>}

      {showForm && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name (optional)"
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Email {requireEmail && <span className="required">*</span>}
              </label>
              <input
                type="email"
                className="form-input"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder={requireEmail ? "Your email" : "Your email (optional)"}
                required={requireEmail}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              Comment <span className="required">*</span>
            </label>
            <textarea
              className="form-input form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              required
              maxLength={2000}
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting || !content.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Comment
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">
          <Loader2 size={24} className="animate-spin" style={{ color: accentColor }} />
        </div>
      ) : comments.length > 0 ? (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <div className="comment-avatar">
                  <User size={16} />
                </div>
                <span className="comment-author">
                  {comment.authorName || "Anonymous"}
                </span>
                <span className="comment-date">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="comment-content">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="empty-state">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )
      )}
    </div>
  );
}
