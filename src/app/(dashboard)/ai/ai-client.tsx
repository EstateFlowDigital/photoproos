"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  createConversation,
  sendMessage,
  getConversation,
  deleteConversation,
  approveAction,
  cancelAction,
  type ConversationSummary,
  type ConversationMessage,
  type PendingAction,
} from "@/lib/actions/ai";
import { motion, AnimatePresence } from "framer-motion";

// Icons
function SparklesIcon({ className }: { className?: string }) {
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
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

function TrashIcon({ className }: { className?: string }) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
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
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
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

interface AIPageClientProps {
  conversations: ConversationSummary[];
  stats: {
    totalConversations: number;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
    thisMonth: {
      conversations: number;
      tokens: number;
      cost: number;
    };
  } | null;
}

const EXAMPLE_PROMPTS = [
  "What are my upcoming bookings this week?",
  "Show me my revenue summary for this month",
  "List my pending invoices",
  "Which clients have spent the most?",
  "Create a new gallery called 'Summer Wedding'",
];

export function AIPageClient({ conversations, stats }: AIPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async (conversationId: string) => {
    setActiveConversation(conversationId);
    const result = await getConversation(conversationId);
    if (result.success && result.data) {
      setMessages(result.data.messages);
      setPendingActions(result.data.pendingActions);
    }
  };

  const handleNewConversation = () => {
    startTransition(async () => {
      const result = await createConversation();
      if (result.success && result.data) {
        setActiveConversation(result.data.id);
        setMessages([]);
        setPendingActions([]);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        });
      }
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !activeConversation) return;

    const userInput = input.trim();
    setInput("");
    setIsLoading(true);

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        id: "temp-" + Date.now(),
        role: "user",
        content: userInput,
        toolName: null,
        toolInput: null,
        toolOutput: null,
        createdAt: new Date(),
      },
    ]);

    const result = await sendMessage(activeConversation, userInput);
    setIsLoading(false);

    if (result.success && result.data) {
      // Refresh conversation to get all messages including tool calls
      loadConversation(activeConversation);
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    startTransition(async () => {
      const result = await deleteConversation(conversationId);
      if (result.success) {
        if (activeConversation === conversationId) {
          setActiveConversation(null);
          setMessages([]);
          setPendingActions([]);
        }
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete conversation",
          variant: "destructive",
        });
      }
    });
  };

  const handleApproveAction = async (actionId: string) => {
    startTransition(async () => {
      const result = await approveAction(actionId);
      if (result.success) {
        toast({ title: "Action approved" });
        if (activeConversation) {
          loadConversation(activeConversation);
        }
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const handleCancelAction = async (actionId: string) => {
    startTransition(async () => {
      const result = await cancelAction(actionId);
      if (result.success) {
        toast({ title: "Action cancelled" });
        if (activeConversation) {
          loadConversation(activeConversation);
        }
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Sidebar */}
      <div
        className={cn(
          "w-72 flex-shrink-0",
          "border-r border-[var(--border)]",
          "bg-[var(--card)]",
          "flex flex-col"
        )}
      >
        {/* New Chat Button */}
        <div className="p-4">
          <Button
            className="w-full"
            onClick={handleNewConversation}
            disabled={isPending}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>

        {/* Conversation List */}
        <div
          className="flex-1 overflow-y-auto px-4 pb-4 space-y-2"
          role="listbox"
          aria-label="Conversation history"
        >
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group p-3 rounded-lg cursor-pointer",
                "transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
                activeConversation === conv.id
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "hover:bg-[var(--background-tertiary)]"
              )}
              onClick={() => loadConversation(conv.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  loadConversation(conv.id);
                }
              }}
              tabIndex={0}
              role="option"
              aria-selected={activeConversation === conv.id}
              aria-label={`${conv.title || "New Conversation"}, ${conv.messageCount} messages`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {conv.title || "New Conversation"}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {conv.messageCount} messages
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  aria-label={`Delete conversation: ${conv.title || "New Conversation"}`}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 hover:text-[var(--error)] transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {conversations.length === 0 && (
            <p className="text-sm text-[var(--foreground-muted)] text-center py-8">
              No conversations yet
            </p>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-4 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--foreground-muted)] mb-2">
              This month
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[var(--foreground-muted)]">Chats:</span>{" "}
                <span className="font-medium">{stats.thisMonth.conversations}</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)]">Cost:</span>{" "}
                <span className="font-medium">
                  ${stats.thisMonth.cost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-6 space-y-4"
              aria-live="polite"
              aria-label="Chat messages"
            >
              <AnimatePresence>
                {messages
                  .filter((m) => m.role !== "tool")
                  .map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "flex-row-reverse" : ""
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex-shrink-0",
                          "flex items-center justify-center",
                          message.role === "user"
                            ? "bg-[var(--primary)]"
                            : "bg-[var(--ai)]"
                        )}
                      >
                        {message.role === "user" ? (
                          <span className="text-white text-sm font-semibold">
                            U
                          </span>
                        ) : (
                          <SparklesIcon className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[70%] p-4 rounded-xl",
                          message.role === "user"
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--card)] border border-[var(--border)]"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex-shrink-0",
                      "flex items-center justify-center",
                      "bg-[var(--ai)]"
                    )}
                  >
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                    <LoaderIcon className="w-5 h-5 text-[var(--foreground-muted)]" />
                  </div>
                </motion.div>
              )}

              {/* Pending Actions */}
              {pendingActions.length > 0 && (
                <div className="space-y-3">
                  {pendingActions.map((action) => (
                    <div
                      key={action.id}
                      className={cn(
                        "p-4 rounded-xl",
                        "border border-[var(--warning)]/30",
                        "bg-[var(--warning)]/5"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <WrenchIcon className="w-4 h-4 text-[var(--warning)]" />
                        <span className="font-medium text-[var(--foreground)]">
                          Action Pending Confirmation
                        </span>
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)] mb-3">
                        {action.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveAction(action.id)}
                          disabled={isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAction(action.id)}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--border)]">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask anything about your business..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
                  disabled={isLoading || !input.trim()}
                  className="self-end"
                >
                  {isLoading ? (
                    <LoaderIcon className="w-4 h-4" />
                  ) : (
                    <SendIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div
                className={cn(
                  "w-16 h-16 mx-auto mb-6 rounded-full",
                  "bg-[var(--ai)]/10",
                  "flex items-center justify-center"
                )}
              >
                <SparklesIcon className="w-8 h-8 text-[var(--ai)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                AI Business Assistant
              </h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                Ask questions about your business, get insights, or let me help
                you create galleries, manage clients, and more.
              </p>

              <Button onClick={handleNewConversation} disabled={isPending}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Start a Conversation
              </Button>

              <div className="mt-8">
                <p className="text-sm text-[var(--foreground-muted)] mb-3">
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Example prompts">
                  {EXAMPLE_PROMPTS.slice(0, 3).map((prompt) => (
                    <Badge
                      key={prompt}
                      variant="secondary"
                      tabIndex={0}
                      role="button"
                      aria-label={`Start conversation with: ${prompt}`}
                      className="cursor-pointer hover:bg-[var(--background-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      onClick={() => {
                        handleNewConversation();
                        setTimeout(() => setInput(prompt), 100);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleNewConversation();
                          setTimeout(() => setInput(prompt), 100);
                        }
                      }}
                    >
                      {prompt}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
