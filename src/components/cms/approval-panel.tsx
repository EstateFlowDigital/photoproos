"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Send,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Loader2,
  UserCheck,
  X,
} from "lucide-react";
import type { ContentApproval } from "@prisma/client";
import {
  requestApproval,
  respondToApproval,
  cancelApproval,
} from "@/lib/actions/marketing-cms";

interface Approver {
  userId: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  respondedAt?: string;
  comment?: string;
}

interface ApprovalPanelProps {
  entityType: string;
  entityId: string;
  entityTitle: string;
  content: Record<string, unknown>;
  existingApproval?: ContentApproval | null;
  onApprovalChange?: () => void;
  className?: string;
}

/**
 * Panel for requesting and managing content approvals
 */
export function ApprovalPanel({
  entityType,
  entityId,
  entityTitle,
  content,
  existingApproval,
  onApprovalChange,
  className,
}: ApprovalPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [approverName, setApproverName] = useState("");
  const [approverId, setApproverId] = useState("");
  const [changesSummary, setChangesSummary] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRequestApproval = () => {
    if (!approverId.trim() || !approverName.trim()) {
      setError("Please enter approver details");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await requestApproval({
        entityType,
        entityId,
        entityTitle,
        contentSnapshot: content,
        changesSummary: changesSummary || undefined,
        approvers: [{ userId: approverId.trim(), name: approverName.trim() }],
      });

      if (result.success) {
        setShowRequestForm(false);
        setApproverName("");
        setApproverId("");
        setChangesSummary("");
        onApprovalChange?.();
      } else {
        setError(result.error || "Failed to request approval");
      }
    });
  };

  const handleCancelApproval = () => {
    if (!existingApproval) return;

    startTransition(async () => {
      const result = await cancelApproval(existingApproval.id);
      if (result.success) {
        onApprovalChange?.();
      } else {
        setError(result.error || "Failed to cancel approval");
      }
    });
  };

  // If there's a pending approval, show its status
  if (existingApproval && ["pending", "in_review"].includes(existingApproval.status)) {
    return (
      <div className={cn("space-y-4", className)}>
        <ApprovalStatusCard
          approval={existingApproval}
          onCancel={handleCancelApproval}
          isCancelling={isPending}
        />
      </div>
    );
  }

  // Show resolved approval if exists
  if (existingApproval && ["approved", "rejected", "cancelled"].includes(existingApproval.status)) {
    return (
      <div className={cn("space-y-4", className)}>
        <ApprovalStatusCard approval={existingApproval} />
        <button
          onClick={() => setShowRequestForm(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
            "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
            "text-sm font-medium transition-colors"
          )}
        >
          <Send className="w-4 h-4" />
          Request New Approval
        </button>
        {showRequestForm && (
          <ApprovalRequestForm
            approverName={approverName}
            setApproverName={setApproverName}
            approverId={approverId}
            setApproverId={setApproverId}
            changesSummary={changesSummary}
            setChangesSummary={setChangesSummary}
            error={error}
            isPending={isPending}
            onSubmit={handleRequestApproval}
            onCancel={() => setShowRequestForm(false)}
          />
        )}
      </div>
    );
  }

  // No existing approval - show request form
  return (
    <div className={cn("space-y-4", className)}>
      {!showRequestForm ? (
        <button
          onClick={() => setShowRequestForm(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
            "border-2 border-dashed border-[var(--border)]",
            "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
            "hover:border-[var(--primary)] transition-colors"
          )}
        >
          <UserCheck className="w-5 h-5" />
          Request Approval
        </button>
      ) : (
        <ApprovalRequestForm
          approverName={approverName}
          setApproverName={setApproverName}
          approverId={approverId}
          setApproverId={setApproverId}
          changesSummary={changesSummary}
          setChangesSummary={setChangesSummary}
          error={error}
          isPending={isPending}
          onSubmit={handleRequestApproval}
          onCancel={() => setShowRequestForm(false)}
        />
      )}
    </div>
  );
}

/**
 * Approval request form
 */
function ApprovalRequestForm({
  approverName,
  setApproverName,
  approverId,
  setApproverId,
  changesSummary,
  setChangesSummary,
  error,
  isPending,
  onSubmit,
  onCancel,
}: {
  approverName: string;
  setApproverName: (v: string) => void;
  approverId: string;
  setApproverId: (v: string) => void;
  changesSummary: string;
  setChangesSummary: (v: string) => void;
  error: string | null;
  isPending: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[var(--foreground)]">
          Request Approval
        </h4>
        <button
          onClick={onCancel}
          className="p-1 rounded hover:bg-[var(--background-elevated)] transition-colors"
          aria-label="Cancel"
        >
          <X className="w-4 h-4 text-[var(--foreground-muted)]" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label
            htmlFor="approver-name"
            className="block text-xs font-medium text-[var(--foreground-muted)] mb-1"
          >
            Approver Name
          </label>
          <input
            id="approver-name"
            type="text"
            value={approverName}
            onChange={(e) => setApproverName(e.target.value)}
            placeholder="e.g., John Smith"
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm",
              "bg-[var(--card)] border border-[var(--border)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
              "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
            )}
          />
        </div>

        <div>
          <label
            htmlFor="approver-id"
            className="block text-xs font-medium text-[var(--foreground-muted)] mb-1"
          >
            Approver User ID
          </label>
          <input
            id="approver-id"
            type="text"
            value={approverId}
            onChange={(e) => setApproverId(e.target.value)}
            placeholder="e.g., user_2xxx..."
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm",
              "bg-[var(--card)] border border-[var(--border)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
              "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
            )}
          />
        </div>

        <div>
          <label
            htmlFor="changes-summary"
            className="block text-xs font-medium text-[var(--foreground-muted)] mb-1"
          >
            Changes Summary (optional)
          </label>
          <textarea
            id="changes-summary"
            value={changesSummary}
            onChange={(e) => setChangesSummary(e.target.value)}
            placeholder="Describe what changes were made..."
            rows={3}
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm resize-y",
              "bg-[var(--card)] border border-[var(--border)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
              "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          disabled={isPending}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg text-sm font-medium",
            "border border-[var(--border)]",
            "hover:bg-[var(--background-elevated)] transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isPending || !approverName.trim() || !approverId.trim()}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
            "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
            "text-sm font-medium transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Request
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Approval status card showing current status
 */
function ApprovalStatusCard({
  approval,
  onCancel,
  isCancelling,
}: {
  approval: ContentApproval;
  onCancel?: () => void;
  isCancelling?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const approvers = approval.approvers as Approver[];

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10 border-yellow-500/20",
      label: "Pending Approval",
    },
    in_review: {
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
      label: "In Review",
    },
    approved: {
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10 border-green-500/20",
      label: "Approved",
    },
    rejected: {
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10 border-red-500/20",
      label: "Rejected",
    },
    cancelled: {
      icon: XCircle,
      color: "text-gray-500",
      bg: "bg-gray-500/10 border-gray-500/20",
      label: "Cancelled",
    },
  };

  const config = statusConfig[approval.status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  return (
    <div className={cn("border rounded-lg overflow-hidden", config.bg)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <StatusIcon className={cn("w-5 h-5", config.color)} />
          <div>
            <p className={cn("text-sm font-medium", config.color)}>
              {config.label}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">
              Requested by {approval.requestedByName}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-[var(--foreground-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--border)]">
          {/* Timeline */}
          <div className="pt-4 space-y-3">
            <h5 className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
              Approval Chain
            </h5>
            {approvers.map((approver, index) => (
              <ApproverStep
                key={index}
                approver={approver}
                isActive={index === approval.currentStep && ["pending", "in_review"].includes(approval.status)}
              />
            ))}
          </div>

          {/* Changes Summary */}
          {approval.changesSummary && (
            <div>
              <h5 className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider mb-2">
                Changes
              </h5>
              <p className="text-sm text-[var(--foreground-secondary)]">
                {approval.changesSummary}
              </p>
            </div>
          )}

          {/* Resolution Note */}
          {approval.resolutionNote && (
            <div>
              <h5 className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider mb-2">
                Resolution Note
              </h5>
              <p className="text-sm text-[var(--foreground-secondary)]">
                {approval.resolutionNote}
              </p>
            </div>
          )}

          {/* Cancel Button */}
          {onCancel && ["pending", "in_review"].includes(approval.status) && (
            <button
              onClick={onCancel}
              disabled={isCancelling}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
                "border border-red-500/20 text-red-500 hover:bg-red-500/10",
                "text-sm font-medium transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Cancel Request
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Individual approver step in timeline
 */
function ApproverStep({
  approver,
  isActive,
}: {
  approver: Approver;
  isActive: boolean;
}) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-[var(--foreground-muted)]",
      bg: "bg-[var(--background-elevated)]",
    },
    approved: {
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    rejected: {
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  };

  const config = statusConfig[approver.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg",
        isActive ? "bg-[var(--primary)]/10 border border-[var(--primary)]/20" : config.bg
      )}
    >
      <StatusIcon className={cn("w-4 h-4 mt-0.5 shrink-0", isActive ? "text-[var(--primary)]" : config.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">
            {approver.name}
          </span>
          {isActive && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--primary)] text-white">
              Current
            </span>
          )}
        </div>
        {approver.respondedAt && (
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            {approver.status === "approved" ? "Approved" : "Rejected"} on{" "}
            {new Date(approver.respondedAt).toLocaleDateString()}
          </p>
        )}
        {approver.comment && (
          <div className="flex items-start gap-1.5 mt-2">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--foreground-muted)] mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--foreground-secondary)] italic">
              "{approver.comment}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Approval response panel for approvers
 */
export function ApprovalResponsePanel({
  approval,
  onResponse,
  className,
}: {
  approval: ContentApproval;
  onResponse?: () => void;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRespond = (action: "approve" | "reject") => {
    startTransition(async () => {
      const result = await respondToApproval({
        approvalId: approval.id,
        action,
        comment: comment || undefined,
      });

      if (result.success) {
        setComment("");
        onResponse?.();
      } else {
        setError(result.error || `Failed to ${action} content`);
      }
    });
  };

  const approvers = approval.approvers as Approver[];
  const _currentApprover = approvers[approval.currentStep];

  return (
    <div className={cn("p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg space-y-4", className)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-[var(--primary)]/10">
          <UserCheck className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-[var(--foreground)]">
            Approval Request
          </h4>
          <p className="text-xs text-[var(--foreground-muted)]">
            From {approval.requestedByName} • {approval.entityTitle}
          </p>
        </div>
      </div>

      {approval.changesSummary && (
        <div className="p-3 bg-[var(--background)] rounded-lg">
          <p className="text-sm text-[var(--foreground-secondary)]">
            {approval.changesSummary}
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="approval-comment"
          className="block text-xs font-medium text-[var(--foreground-muted)] mb-1"
        >
          Comment (optional)
        </label>
        <textarea
          id="approval-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className={cn(
            "w-full px-3 py-2 rounded-lg text-sm resize-y",
            "bg-[var(--background)] border border-[var(--border)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
            "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleRespond("reject")}
          disabled={isPending}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
            "bg-red-500/10 text-red-500 hover:bg-red-500/20",
            "text-sm font-medium transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              Reject
            </>
          )}
        </button>
        <button
          onClick={() => handleRespond("approve")}
          disabled={isPending}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
            "bg-green-500 text-white hover:bg-green-600",
            "text-sm font-medium transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Approve
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Compact approval badge for lists
 */
export function ApprovalBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const statusConfig = {
    pending: {
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      label: "Pending",
    },
    in_review: {
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      label: "In Review",
    },
    approved: {
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      label: "Approved",
    },
    rejected: {
      color: "bg-red-500/10 text-red-500 border-red-500/20",
      label: "Rejected",
    },
    cancelled: {
      color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      label: "Cancelled",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
