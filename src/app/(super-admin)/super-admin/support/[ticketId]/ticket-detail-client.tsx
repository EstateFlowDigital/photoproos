"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  sendAdminReply,
  resolveTicket,
  updateTicketPriority,
  type AdminSupportTicketDetail,
} from "@/lib/actions/support-tickets";
import { formatDistanceToNow, format } from "date-fns";

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

interface TicketDetailClientProps {
  ticket: AdminSupportTicketDetail;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
  medium: "bg-[var(--primary)]/10 text-[var(--primary)]",
  high: "bg-[var(--warning)]/10 text-[var(--warning)]",
  urgent: "bg-[var(--error)]/10 text-[var(--error)]",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-[var(--warning)]/10 text-[var(--warning)]",
  in_progress: "bg-[var(--primary)]/10 text-[var(--primary)]",
  resolved: "bg-[var(--success)]/10 text-[var(--success)]",
  closed: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
};

const CATEGORY_LABELS: Record<string, string> = {
  support_request: "Support Request",
  report_issue: "Report Issue",
  billing: "Billing",
  questions: "Question",
  feature_request: "Feature Request",
  other: "Other",
};

export function TicketDetailClient({ ticket }: TicketDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolveXp, setResolveXp] = useState("0");
  const [resolveNote, setResolveNote] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket.messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    startTransition(async () => {
      const result = await sendAdminReply(ticket.id, message.trim());
      if (result.success) {
        setMessage("");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send message",
          variant: "destructive",
        });
      }
    });
  };

  const handlePriorityChange = (priority: string) => {
    startTransition(async () => {
      const result = await updateTicketPriority(
        ticket.id,
        priority as "low" | "medium" | "high" | "urgent"
      );
      if (result.success) {
        toast({
          title: "Priority Updated",
          description: `Priority changed to ${priority}`,
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update priority",
          variant: "destructive",
        });
      }
    });
  };

  const handleResolve = () => {
    startTransition(async () => {
      const result = await resolveTicket(
        ticket.id,
        parseInt(resolveXp) || 0,
        resolveNote || undefined
      );
      if (result.success) {
        toast({
          title: "Ticket Resolved",
          description: parseInt(resolveXp) > 0
            ? `Ticket resolved with ${resolveXp} XP reward`
            : "Ticket resolved successfully",
        });
        setIsResolveDialogOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resolve ticket",
          variant: "destructive",
        });
      }
    });
  };

  const isResolved = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/super-admin/support" className="flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Tickets
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              {ticket.subject}
            </h1>
            <Badge
              variant="secondary"
              className={cn("capitalize", STATUS_COLORS[ticket.status])}
            >
              {ticket.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
            <span>
              From: {ticket.user.fullName || ticket.user.email}
              {ticket.organization && ` (${ticket.organization.name})`}
            </span>
            <span>&bull;</span>
            <span>{CATEGORY_LABELS[ticket.category]}</span>
            <span>&bull;</span>
            <span>
              Created{" "}
              {formatDistanceToNow(new Date(ticket.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={ticket.priority}
            onValueChange={handlePriorityChange}
            disabled={isPending || isResolved}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          {!isResolved && (
            <Button onClick={() => setIsResolveDialogOpen(true)}>
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Resolve
            </Button>
          )}

          <Button variant="outline" asChild>
            <Link href={`/super-admin/users/${ticket.user.id}`}>
              <UserIcon className="w-4 h-4 mr-2" />
              View User
            </Link>
          </Button>
        </div>
      </div>

      {/* User Info Card */}
      <div
        className={cn(
          "p-4 rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--card)]"
        )}
      >
        <div className="flex items-center gap-4">
          {ticket.user.avatarUrl ? (
            <img
              src={ticket.user.avatarUrl}
              alt=""
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div
              className={cn(
                "w-12 h-12 rounded-full",
                "bg-[var(--primary)]/10",
                "flex items-center justify-center",
                "text-[var(--primary)] font-semibold"
              )}
            >
              {(ticket.user.fullName || ticket.user.email)[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium text-[var(--foreground)]">
              {ticket.user.fullName || "Unknown User"}
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">
              {ticket.user.email}
            </div>
            {ticket.organization && (
              <div className="text-sm text-[var(--foreground-muted)]">
                {ticket.organization.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className={cn(
          "rounded-xl overflow-hidden",
          "border border-[var(--border)]",
          "bg-[var(--card)]"
        )}
      >
        <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
          {ticket.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.isFromAdmin ? "flex-row-reverse" : ""
              )}
            >
              {/* Avatar */}
              {msg.isFromAdmin ? (
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex-shrink-0",
                    "bg-[var(--primary)]",
                    "flex items-center justify-center",
                    "text-white text-sm font-semibold"
                  )}
                >
                  S
                </div>
              ) : msg.senderAvatar ? (
                <img
                  src={msg.senderAvatar}
                  alt=""
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              ) : (
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex-shrink-0",
                    "bg-[var(--background-tertiary)]",
                    "flex items-center justify-center",
                    "text-[var(--foreground-muted)] text-sm font-semibold"
                  )}
                >
                  {(msg.senderName || "U")[0].toUpperCase()}
                </div>
              )}

              {/* Message */}
              <div
                className={cn(
                  "flex-1 max-w-[80%]",
                  msg.isFromAdmin ? "text-right" : ""
                )}
              >
                <div
                  className={cn(
                    "inline-block p-3 rounded-xl text-left",
                    msg.isFromAdmin
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--background-tertiary)] text-[var(--foreground)]"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div
                  className={cn(
                    "text-xs text-[var(--foreground-muted)] mt-1",
                    msg.isFromAdmin ? "text-right" : ""
                  )}
                >
                  {msg.senderName || (msg.isFromAdmin ? "Support Team" : "User")}
                  {" • "}
                  {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!isResolved && (
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your reply..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                className="resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isPending || !message.trim()}
                className="self-end"
              >
                {isPending ? (
                  <LoaderIcon className="w-4 h-4" />
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Resolved Info */}
      {isResolved && (
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--success)]/30",
            "bg-[var(--success)]/5"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-[var(--success)]" />
            <span className="font-medium text-[var(--success)]">
              Ticket Resolved
            </span>
          </div>
          <p className="text-sm text-[var(--foreground-muted)]">
            Resolved{" "}
            {ticket.resolvedAt
              ? formatDistanceToNow(new Date(ticket.resolvedAt), {
                  addSuffix: true,
                })
              : ""}
            {ticket.xpAwarded > 0 && (
              <>
                {" • "}
                <span className="text-[var(--warning)]">
                  {ticket.xpAwarded} XP awarded
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Resolve Ticket</DialogTitle>
            <DialogDescription>
              Mark this ticket as resolved. Optionally award XP to the user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="xp">XP Reward (optional)</Label>
              <Input
                id="xp"
                type="number"
                placeholder="0"
                value={resolveXp}
                onChange={(e) => setResolveXp(e.target.value)}
              />
              <p className="text-xs text-[var(--foreground-muted)]">
                Award XP for providing valuable feedback or helping improve the
                platform
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Resolution Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="Summary of how the issue was resolved..."
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsResolveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleResolve} disabled={isPending}>
                {isPending ? (
                  <LoaderIcon className="w-4 h-4 mr-2" />
                ) : (
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                )}
                Resolve Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
