"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  MessageSquare,
  Send,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getClientConversations,
  getClientMessages,
  sendClientMessage,
  markClientConversationAsRead,
  type ClientConversationWithDetails,
  type ClientMessageWithDetails,
} from "@/lib/actions/client-messages";
import {
  createChatRequest,
  getClientChatRequests,
  cancelChatRequest,
  type ChatRequestWithDetails,
} from "@/lib/actions/chat-requests";
import type { ChatRequestStatus } from "@prisma/client";

interface MessagesTabProps {
  clientId: string;
}

export function MessagesTab({ clientId: _clientId }: MessagesTabProps) {
  const [view, setView] = useState<"list" | "conversation" | "new-request">("list");
  const [conversations, setConversations] = useState<ClientConversationWithDetails[]>([]);
  const [chatRequests, setChatRequests] = useState<ChatRequestWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ClientConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<ClientMessageWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load conversations and chat requests on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const [conversationsResult, requestsResult] = await Promise.all([
      getClientConversations(),
      getClientChatRequests(),
    ]);

    if (conversationsResult.success) {
      setConversations(conversationsResult.data);
    }
    if (requestsResult.success) {
      setChatRequests(requestsResult.data);
    }
    setIsLoading(false);
  }

  async function handleSelectConversation(conversation: ClientConversationWithDetails) {
    setSelectedConversation(conversation);
    setView("conversation");

    // Load messages
    const messagesResult = await getClientMessages(conversation.id);
    if (messagesResult.success) {
      setMessages(messagesResult.data.messages);
    }

    // Mark as read
    await markClientConversationAsRead(conversation.id);
  }

  function handleBack() {
    setView("list");
    setSelectedConversation(null);
    setMessages([]);
    loadData(); // Refresh data
  }

  if (isLoading) {
    return <MessagesTabSkeleton />;
  }

  if (view === "new-request") {
    return (
      <NewChatRequestView
        onBack={handleBack}
        onSuccess={() => {
          loadData();
          setView("list");
        }}
      />
    );
  }

  if (view === "conversation" && selectedConversation) {
    return (
      <ConversationView
        conversation={selectedConversation}
        initialMessages={messages}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Messages</h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            Communicate with the team
          </p>
        </div>
        <button
          onClick={() => setView("new-request")}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Request Chat
        </button>
      </div>

      {/* Pending Chat Requests */}
      {chatRequests.filter((r) => r.status === "pending").length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)]">
            Pending Requests
          </h3>
          {chatRequests
            .filter((r) => r.status === "pending")
            .map((request) => (
              <ChatRequestCard
                key={request.id}
                request={request}
                onCancel={async () => {
                  await cancelChatRequest(request.id);
                  loadData();
                }}
              />
            ))}
        </div>
      )}

      {/* Conversations */}
      {conversations.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)]">
            Conversations
          </h3>
          {conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              onClick={() => handleSelectConversation(conversation)}
            />
          ))}
        </div>
      ) : chatRequests.filter((r) => r.status === "pending").length === 0 ? (
        <EmptyState onNewRequest={() => setView("new-request")} />
      ) : null}

      {/* Chat Request History */}
      {chatRequests.filter((r) => r.status !== "pending").length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)]">
            Request History
          </h3>
          {chatRequests
            .filter((r) => r.status !== "pending")
            .map((request) => (
              <ChatRequestCard key={request.id} request={request} />
            ))}
        </div>
      )}
    </div>
  );
}

function ConversationCard({
  conversation,
  onClick,
}: {
  conversation: ClientConversationWithDetails;
  onClick: () => void;
}) {
  const teamMembers = conversation.participants
    .filter((p) => p.user)
    .map((p) => p.user?.fullName || "Team Member");

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 text-left transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
        <MessageSquare className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <span className="font-medium text-[var(--foreground)]">
            {conversation.name || "Support Chat"}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {conversation.unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-xs font-medium text-white">
                {conversation.unreadCount}
              </span>
            )}
            {conversation.lastMessageAt && (
              <span className="text-xs text-[var(--foreground-muted)]">
                {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-[var(--foreground-muted)] truncate">
          With: {teamMembers.slice(0, 2).join(", ")}
          {teamMembers.length > 2 && ` +${teamMembers.length - 2}`}
        </p>
      </div>
    </button>
  );
}

function ChatRequestCard({
  request,
  onCancel,
}: {
  request: ChatRequestWithDetails;
  onCancel?: () => void;
}) {
  const statusConfig: Record<
    ChatRequestStatus,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    pending: {
      label: "Pending",
      icon: <Clock className="h-4 w-4" />,
      color: "text-[var(--warning)] bg-[var(--warning)]/10",
    },
    approved: {
      label: "Approved",
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-[var(--success)] bg-[var(--success)]/10",
    },
    rejected: {
      label: "Declined",
      icon: <XCircle className="h-4 w-4" />,
      color: "text-[var(--error)] bg-[var(--error)]/10",
    },
    expired: {
      label: "Expired",
      icon: <Clock className="h-4 w-4" />,
      color: "text-[var(--foreground-muted)] bg-[var(--background-tertiary)]",
    },
  };

  const config = statusConfig[request.status];

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--foreground)]">
              {request.subject}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${config.color}`}
            >
              {config.icon}
              {config.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--foreground-muted)] line-clamp-2">
            {request.initialMessage}
          </p>
          <p className="mt-2 text-xs text-[var(--foreground-muted)]">
            Submitted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </p>
        </div>
        {request.status === "pending" && onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--error)] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function ConversationView({
  conversation,
  initialMessages,
  onBack,
}: {
  conversation: ClientConversationWithDetails;
  initialMessages: ClientMessageWithDetails[];
  onBack: () => void;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const result = await getClientMessages(conversation.id);
      if (result.success) {
        setMessages(result.data.messages);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [conversation.id]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    startTransition(async () => {
      const result = await sendClientMessage(conversation.id, messageContent);
      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const teamMembers = conversation.participants
    .filter((p) => p.user)
    .map((p) => p.user?.fullName || "Team Member");

  return (
    <div className="flex flex-col h-[600px] rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--card-border)] px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium text-[var(--foreground)]">
            {conversation.name || "Support Chat"}
          </h3>
          <p className="text-xs text-[var(--foreground-muted)]">
            With: {teamMembers.join(", ")}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.senderClientId !== null;
              const showTimestamp =
                index === 0 ||
                new Date(message.createdAt).getTime() -
                  new Date(messages[index - 1].createdAt).getTime() >
                  5 * 60 * 1000;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showTimestamp={showTimestamp}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--card-border)] p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isPending}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
  showTimestamp,
}: {
  message: ClientMessageWithDetails;
  isOwn: boolean;
  showTimestamp: boolean;
}) {
  return (
    <div className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} gap-2`}>
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${
          isOwn
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--background-tertiary)] text-[var(--foreground)]"
        }`}
      >
        {(message.senderName || "?").charAt(0).toUpperCase()}
      </div>
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? "bg-[var(--primary)] text-white rounded-tr-md"
              : "bg-[var(--background-tertiary)] text-[var(--foreground)] rounded-tl-md"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        {showTimestamp && (
          <span className="mt-1 text-xs text-[var(--foreground-muted)]">
            {format(new Date(message.createdAt), "h:mm a")}
          </span>
        )}
      </div>
    </div>
  );
}

function NewChatRequestView({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !message.trim()) {
      setError("Please fill in all fields");
      return;
    }

    startTransition(async () => {
      const result = await createChatRequest({
        subject: subject.trim(),
        initialMessage: message.trim(),
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Request a Chat
          </h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            Send a request to start a conversation with the team
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-[var(--foreground)] mb-1"
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What would you like to discuss?"
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-[var(--foreground)] mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what you need help with..."
            rows={5}
            className="w-full resize-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--error)]">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send Request
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] p-4">
        <p className="text-sm text-[var(--foreground-muted)]">
          <strong>Note:</strong> Your request will be reviewed by the team. Once approved,
          you'll be able to chat directly with them. You'll receive a notification when
          your request is processed.
        </p>
      </div>
    </div>
  );
}

function EmptyState({ onNewRequest }: { onNewRequest: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10">
        <MessageSquare className="h-8 w-8 text-[var(--primary)]" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">
        No conversations yet
      </h3>
      <p className="mt-2 text-center text-sm text-[var(--foreground-muted)] max-w-sm">
        Request a chat to start communicating with the team about your projects,
        galleries, or any questions you have.
      </p>
      <button
        onClick={onNewRequest}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
      >
        <Plus className="h-4 w-4" />
        Request a Chat
      </button>
    </div>
  );
}

function MessagesTabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="h-6 w-24 rounded bg-[var(--background-tertiary)]" />
          <div className="mt-1 h-4 w-48 rounded bg-[var(--background-tertiary)]" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-[var(--background-tertiary)]" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)]"
          />
        ))}
      </div>
    </div>
  );
}
