"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, isToday, isYesterday } from "date-fns";
import {
  Send,
  MoreVertical,
  Users,
  Pin,
  BellOff,
  Trash2,
  Archive,
  UserPlus,
  Hash,
  MessageSquare,
  Headphones,
  Smile,
  Paperclip,
  Phone,
  Video,
  Info,
  CheckCheck,
  X,
  FileText,
  Download,
  Edit3,
  Copy,
  Search,
  Bell,
  BellRing,
  AtSign,
  Link as LinkIcon,
  Zap,
  Reply,
  Star,
  Forward,
  Loader2,
} from "lucide-react";
import { QuickReplyPicker } from "@/components/messaging/quick-reply-picker";
import { EmojiPicker, ReactionPicker } from "@/components/messaging/emoji-picker";
import { ThreadView } from "@/components/messaging/thread-view";
import { ReadReceiptsDisplay } from "@/components/messaging/read-receipts";
import { TypingIndicator, useTypingIndicator } from "@/components/messaging/typing-indicator";
import { CallInterface } from "@/components/messaging/call-interface";
import { IncomingCall } from "@/components/messaging/incoming-call";
import { ForwardMessageModal } from "@/components/messaging/forward-message-modal";
import { useCall } from "@/hooks/use-call";
import type { ConversationWithDetails } from "@/lib/actions/conversations";
import type { MessageWithDetails, MessageAttachment } from "@/lib/actions/messages";
import {
  sendMessage,
  markConversationAsRead,
  addReaction,
  getConversationMessages,
  editMessage,
  deleteMessage,
  searchMessages,
  getBatchAttachmentUploadUrls,
} from "@/lib/actions/messages";
import {
  archiveConversation,
  deleteConversation,
} from "@/lib/actions/conversations";
import {
  toggleMuteConversation,
  togglePinConversation,
} from "@/lib/actions/conversation-participants";
import { toggleStarMessage } from "@/lib/actions/starred-messages";
import type { ConversationType, MessageReactionType } from "@prisma/client";

interface ConversationPageClientProps {
  conversation: ConversationWithDetails;
  initialMessages: MessageWithDetails[];
  currentUserId: string;
}

const TYPE_ICONS: Record<ConversationType, React.ReactNode> = {
  direct: <MessageSquare className="h-5 w-5" />,
  group: <Users className="h-5 w-5" />,
  channel: <Hash className="h-5 w-5" />,
  client_support: <Headphones className="h-5 w-5" />,
};

const REACTION_TYPES: MessageReactionType[] = [
  "thumbs_up",
  "thumbs_down",
  "heart",
  "check",
  "eyes",
  "celebration",
];

const REACTION_EMOJIS: Record<MessageReactionType, string> = {
  thumbs_up: "👍",
  thumbs_down: "👎",
  heart: "❤️",
  check: "✅",
  eyes: "👀",
  celebration: "🎉",
};

// Link preview regex
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function ConversationPageClient({
  conversation,
  initialMessages,
  currentUserId,
}: ConversationPageClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);

  // Typing indicator hook
  const { handleTyping, stopTyping } = useTypingIndicator({
    conversationId: conversation.id,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Attachment state
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);

  // Edit state
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MessageWithDetails[]>([]);

  // Mention state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);

  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Quick reply state
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // Thread state
  const [activeThread, setActiveThread] = useState<MessageWithDetails | null>(null);

  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  // Upload progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Call hook
  const {
    activeCall,
    incomingCall,
    isStartingCall,
    startVoiceCall,
    startVideoCall,
    acceptCall,
    dismissIncomingCall,
    clearActiveCall,
  } = useCall({
    conversationId: conversation.id,
    currentUserId,
  });

  // Forward modal state
  const [forwardingMessage, setForwardingMessage] = useState<MessageWithDetails | null>(null);

  // Starred messages state (track locally for optimistic updates)
  const [starredMessageIds, setStarredMessageIds] = useState<Set<string>>(new Set());

  const displayName = getConversationDisplayName(conversation, currentUserId);
  const icon = TYPE_ICONS[conversation.type];
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  // Get participants for mentions
  const mentionableUsers = conversation.participants
    .filter(p => p.userId !== currentUserId && (p.user || p.client))
    .map(p => ({
      id: p.userId || p.clientId || "",
      name: p.user?.fullName || p.client?.fullName || "Unknown",
      type: p.userId ? "user" : "client",
    }))
    .filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase()));

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  // Mark as read on mount and when messages update
  useEffect(() => {
    markConversationAsRead(conversation.id);
  }, [conversation.id, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Use ref to track message count to avoid stale closures
  const messageCountRef = useRef(messages.length);
  useEffect(() => {
    messageCountRef.current = messages.length;
  }, [messages.length]);

  // Polling for new messages with notifications
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const result = await getConversationMessages(conversation.id, {
        limit: 50,
        parentId: null,
      });
      if (result.success) {
        const newMessages = result.data.messages;

        // Check for new messages and send notification
        if (newMessages.length > messageCountRef.current && notificationsEnabled && document.hidden) {
          const latestMessage = newMessages[newMessages.length - 1];
          if (latestMessage.senderUserId !== currentUserId) {
            showNotification(latestMessage);
          }
        }

        setMessages(newMessages);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [conversation.id, notificationsEnabled, currentUserId]);

  // Show browser notification
  const showNotification = (message: MessageWithDetails) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const senderName = message.senderUser?.fullName || message.senderClient?.fullName || "Someone";
      new Notification(`New message from ${senderName}`, {
        body: message.content.slice(0, 100),
        icon: "/icon-192.png",
        tag: conversation.id,
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files]);

      // Generate previews for images
      files.forEach(file => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setAttachmentPreviews(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        } else {
          setAttachmentPreviews(prev => [...prev, ""]);
        }
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle message input change with mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    handleTyping(); // Update typing indicator

    // Check for @ mentions
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      setShowMentions(true);
      setMentionQuery(atMatch[1]);
      setMentionIndex(0);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  // Insert mention
  const insertMention = (user: { id: string; name: string }) => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = newMessage.slice(0, cursorPos);
    const textAfterCursor = newMessage.slice(cursorPos);
    const atPos = textBeforeCursor.lastIndexOf("@");

    const newText = textBeforeCursor.slice(0, atPos) + `@${user.name} ` + textAfterCursor;
    setNewMessage(newText);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  // Handle quick reply selection
  const handleQuickReplySelect = (content: string) => {
    setNewMessage(content);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    const messageContent = newMessage.trim();
    const filesToUpload = [...attachments];

    // Extract mentions
    const mentionMatches = messageContent.match(/@(\w+\s\w+)/g);
    const mentions = mentionMatches?.map(m => m.slice(1)) || [];

    setNewMessage("");
    setAttachments([]);
    setAttachmentPreviews([]);
    stopTyping(); // Clear typing indicator

    // Upload attachments to R2 if any
    const messageAttachments: MessageAttachment[] = [];
    if (filesToUpload.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Get presigned URLs for all files
        const urlsResult = await getBatchAttachmentUploadUrls(
          conversation.id,
          filesToUpload.map(file => ({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
          }))
        );

        if (!urlsResult.success) {
          console.error("Failed to get upload URLs:", urlsResult.error);
          setIsUploading(false);
          return;
        }

        // Upload each file to R2
        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          const uploadInfo = urlsResult.data[i];

          try {
            const response = await fetch(uploadInfo.uploadUrl, {
              method: "PUT",
              body: file,
              headers: {
                "Content-Type": file.type,
              },
            });

            if (!response.ok) {
              console.error(`Failed to upload ${file.name}`);
              continue;
            }

            // Determine attachment type
            let attachmentType: "image" | "file" | "video" = "file";
            if (file.type.startsWith("image/")) {
              attachmentType = "image";
            } else if (file.type.startsWith("video/")) {
              attachmentType = "video";
            }

            messageAttachments.push({
              type: attachmentType,
              url: uploadInfo.publicUrl,
              name: file.name,
              size: file.size,
              mimeType: file.type,
            });

            // Update progress
            setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
          } catch (uploadError) {
            console.error(`Error uploading ${file.name}:`, uploadError);
          }
        }
      } catch (error) {
        console.error("Error during upload:", error);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }

    startTransition(async () => {
      const result = await sendMessage({
        conversationId: conversation.id,
        content: messageContent,
        attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
        mentions: mentions.length > 0 ? mentions : undefined,
      });

      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mention navigation
    if (showMentions && mentionableUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex(prev => Math.min(prev + 1, mentionableUsers.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex(prev => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(mentionableUsers[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowMentions(false);
        return;
      }
    }

    // Send on Enter (without shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle message edit
  const handleStartEdit = (message: MessageWithDetails) => {
    setEditingMessage(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editContent.trim()) return;

    startTransition(async () => {
      const result = await editMessage(editingMessage, editContent.trim());
      if (result.success) {
        setMessages(prev => prev.map(m => m.id === editingMessage ? result.data : m));
      }
      setEditingMessage(null);
      setEditContent("");
    });
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent("");
  };

  // Handle message delete
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;

    startTransition(async () => {
      const result = await deleteMessage(messageId);
      if (result.success) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    });
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    startTransition(async () => {
      const result = await searchMessages(conversation.id, searchQuery);
      if (result.success) {
        setSearchResults(result.data);
      }
    });
  };

  // Copy message
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleReaction = (messageId: string, type: MessageReactionType) => {
    startTransition(async () => {
      await addReaction(messageId, type);
      const result = await getConversationMessages(conversation.id, {
        limit: 50,
        parentId: null,
      });
      if (result.success) {
        setMessages(result.data.messages);
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      await archiveConversation(conversation.id);
      router.push("/messages");
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      startTransition(async () => {
        await deleteConversation(conversation.id);
        router.push("/messages");
      });
    }
  };

  const handleToggleMute = () => {
    startTransition(async () => {
      await toggleMuteConversation(conversation.id);
      router.refresh();
    });
  };

  const handleTogglePin = () => {
    startTransition(async () => {
      await togglePinConversation(conversation.id);
      router.refresh();
    });
  };

  // Star message handler
  const handleStarMessage = async (messageId: string) => {
    // Optimistic update
    setStarredMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });

    await toggleStarMessage(messageId);
  };

  // Forward message handler
  const handleForwardMessage = (message: MessageWithDetails) => {
    setForwardingMessage(message);
  };

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  // Handle emoji selection from picker
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      return [emoji, ...filtered].slice(0, 8);
    });
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Handle opening a thread
  const handleOpenThread = (message: MessageWithDetails) => {
    setActiveThread(message);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main Chat View */}
      <div className={`chat-view flex flex-1 flex-col overflow-hidden ${activeThread ? "hidden md:flex md:w-[60%]" : ""}`}>
      {/* Chat Header */}
      <header className="chat-header flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white font-medium text-sm">
              {conversation.avatarUrl ? (
                <img
                  src={conversation.avatarUrl}
                  alt={displayName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : conversation.type === "direct" ? (
                initials
              ) : (
                icon
              )}
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--card)] bg-green-500" />
          </div>

          <div>
            <h2 className="font-semibold text-[var(--foreground)]">{displayName}</h2>
            <p className="text-xs text-[var(--foreground-muted)]">
              {conversation.type === "direct"
                ? "Active now"
                : `${conversation.participants.length} members`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1" role="toolbar" aria-label="Conversation actions">
          {/* Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              showSearch ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
            }`}
            aria-label="Search messages"
            aria-pressed={showSearch}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={requestNotificationPermission}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              notificationsEnabled ? "text-[var(--primary)]" : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
            }`}
            aria-label={notificationsEnabled ? "Notifications enabled" : "Enable notifications"}
            aria-pressed={notificationsEnabled}
          >
            {notificationsEnabled ? <BellRing className="h-5 w-5" aria-hidden="true" /> : <Bell className="h-5 w-5" aria-hidden="true" />}
          </button>

          {/* Voice Call - Coming Soon */}
          <button
            disabled
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground-muted)] opacity-50 cursor-not-allowed"
            aria-label="Voice call - Coming soon"
            title="Coming soon"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
          </button>
          {/* Video Call - Coming Soon */}
          <button
            disabled
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground-muted)] opacity-50 cursor-not-allowed"
            aria-label="Video call - Coming soon"
            title="Coming soon"
          >
            <Video className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
            aria-label="View conversation info"
          >
            <Info className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={showMenu}
            >
              <MoreVertical className="h-5 w-5" aria-hidden="true" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} aria-hidden="true" />
                <div
                  className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-xl"
                  role="menu"
                  aria-orientation="vertical"
                  aria-label="Conversation options"
                >
                  <button
                    onClick={() => { handleTogglePin(); setShowMenu(false); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                    role="menuitem"
                  >
                    <Pin className="h-4 w-4" aria-hidden="true" />
                    Pin Conversation
                  </button>
                  <button
                    onClick={() => { handleToggleMute(); setShowMenu(false); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                    role="menuitem"
                  >
                    <BellOff className="h-4 w-4" aria-hidden="true" />
                    Mute Notifications
                  </button>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                    role="menuitem"
                  >
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    Add People
                  </button>
                  <hr className="my-1 border-[var(--card-border)]" role="separator" />
                  <button
                    onClick={() => { handleArchive(); setShowMenu(false); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                    role="menuitem"
                  >
                    <Archive className="h-4 w-4" aria-hidden="true" />
                    Archive
                  </button>
                  <button
                    onClick={() => { handleDelete(); setShowMenu(false); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                    role="menuitem"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Search Bar (Collapsible) */}
      {showSearch && (
        <div className="border-b border-[var(--card-border)] bg-[var(--background)] p-3" role="search">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search in conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full rounded-lg border-0 bg-[var(--background-tertiary)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                aria-label="Search messages in this conversation"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isPending}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
            >
              Search
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 max-h-48 overflow-y-auto space-y-2" role="region" aria-label="Search results" aria-live="polite">
              <p className="text-xs text-[var(--foreground-muted)]">{searchResults.length} results found</p>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  className="w-full rounded-lg bg-[var(--card)] p-2 text-sm text-left cursor-pointer hover:bg-[var(--background-hover)]"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchResults([]);
                    setSearchQuery("");
                  }}
                >
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {result.senderUser?.fullName || result.senderClient?.fullName} • {format(new Date(result.createdAt), "MMM d, h:mm a")}
                  </p>
                  <p className="text-[var(--foreground)] truncate">{result.content}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="chat-messages flex-1 overflow-y-auto bg-[var(--background)] px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-600">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-[var(--foreground)]">
                Start the conversation
              </h3>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                Send a message to {displayName} to begin chatting.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center mb-4">
                  <span className="rounded-full bg-[var(--background-tertiary)] px-3 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                    {date}
                  </span>
                </div>

                {/* Messages for this date */}
                <div className="space-y-1">
                  {dateMessages.map((message, index) => {
                    const isOwn = message.senderUserId === currentUserId;
                    const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                    const nextMessage = index < dateMessages.length - 1 ? dateMessages[index + 1] : null;

                    const showAvatar = !isOwn && (
                      !nextMessage ||
                      nextMessage.senderUserId !== message.senderUserId ||
                      nextMessage.senderClientId !== message.senderClientId
                    );

                    const isFirstInGroup = !prevMessage ||
                      prevMessage.senderUserId !== message.senderUserId ||
                      prevMessage.senderClientId !== message.senderClientId;

                    const isLastInGroup = !nextMessage ||
                      nextMessage.senderUserId !== message.senderUserId ||
                      nextMessage.senderClientId !== message.senderClientId;

                    const showTime = isLastInGroup || (
                      nextMessage &&
                      new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() > 5 * 60 * 1000
                    );

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        showAvatar={showAvatar}
                        showTime={showTime}
                        isFirstInGroup={isFirstInGroup}
                        isLastInGroup={isLastInGroup}
                        isEditing={editingMessage === message.id}
                        editContent={editContent}
                        onEditContentChange={setEditContent}
                        onStartEdit={() => handleStartEdit(message)}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        onDelete={() => handleDeleteMessage(message.id)}
                        onCopy={() => handleCopyMessage(message.content)}
                        onReaction={(type) => handleReaction(message.id, type)}
                        onOpenThread={() => handleOpenThread(message)}
                        onStar={() => handleStarMessage(message.id)}
                        onForward={() => handleForwardMessage(message)}
                        isStarred={starredMessageIds.has(message.id)}
                        allowReactions={conversation.allowReactions}
                        allowThreads={conversation.allowThreads}
                        currentUserId={currentUserId}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="border-t border-[var(--card-border)] bg-[var(--card)] p-3" role="status" aria-label="Uploading attachments">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--foreground)]">Uploading attachments...</span>
                <span className="text-sm text-[var(--foreground-muted)]">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--background-tertiary)]">
                <div
                  className="h-2 rounded-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && !isUploading && (
        <div className="border-t border-[var(--card-border)] bg-[var(--card)] p-3" role="region" aria-label="Attachments to send">
          <div className="flex gap-2 overflow-x-auto">
            {attachments.map((file, index) => (
              <div key={index} className="relative flex-shrink-0">
                {file.type.startsWith("image/") && attachmentPreviews[index] ? (
                  <img
                    src={attachmentPreviews[index]}
                    alt={`Attachment preview: ${file.name}`}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-lg bg-[var(--background-tertiary)]" role="img" aria-label={`File: ${file.name}`}>
                    <FileText className="h-8 w-8 text-[var(--foreground-muted)]" aria-hidden="true" />
                    <span className="mt-1 text-[10px] text-[var(--foreground-muted)] truncate max-w-[72px]">
                      {file.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--error)] text-white"
                  aria-label={`Remove attachment ${file.name}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Typing Indicator */}
      <TypingIndicator conversationId={conversation.id} />

      {/* Message Input */}
      <div className="chat-input border-t border-[var(--card-border)] bg-[var(--card)] p-4">
        <div className="flex items-end gap-3">
          {/* Attachment Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="hidden"
            onChange={handleFileSelect}
            aria-label="Upload attachments"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
            aria-label="Attach files"
          >
            <Paperclip className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Quick Reply Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                showQuickReplies
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--warning)] hover:bg-[var(--warning)]/10"
              }`}
              aria-label="Quick replies"
              aria-expanded={showQuickReplies}
              aria-haspopup="dialog"
            >
              <Zap className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Quick Reply Picker */}
            <QuickReplyPicker
              isOpen={showQuickReplies}
              onClose={() => setShowQuickReplies(false)}
              onSelect={handleQuickReplySelect}
              position="above"
            />
          </div>

          {/* Input Field */}
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (@ to mention)"
              rows={1}
              className="message-input w-full resize-none rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 pr-12 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-0"
              style={{
                minHeight: "42px",
                maxHeight: "120px",
              }}
              aria-label="Message input"
              aria-describedby={showMentions ? "mention-list" : undefined}
              aria-expanded={showMentions}
              aria-haspopup="listbox"
              aria-autocomplete="list"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                showEmojiPicker
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
              }`}
              aria-label="Add emoji"
              aria-expanded={showEmojiPicker}
              aria-haspopup="dialog"
            >
              <Smile className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Emoji Picker */}
            <EmojiPicker
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
              onSelect={handleEmojiSelect}
              position="above"
              recentEmojis={recentEmojis}
            />

            {/* Mention Autocomplete */}
            {showMentions && mentionableUsers.length > 0 && (
              <div
                id="mention-list"
                className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-xl"
                role="listbox"
                aria-label="Mention suggestions"
              >
                {mentionableUsers.slice(0, 5).map((user, index) => (
                  <button
                    key={user.id}
                    onClick={() => insertMention(user)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${
                      index === mentionIndex
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                    }`}
                    role="option"
                    aria-selected={index === mentionIndex}
                  >
                    <AtSign className="h-4 w-4" aria-hidden="true" />
                    {user.name}
                    <span className="text-xs text-[var(--foreground-muted)]">
                      ({user.type})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && attachments.length === 0) || isPending}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50 disabled:scale-95"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      </div>

      {/* Thread Panel */}
      {activeThread && (
        <div className="w-full md:w-[40%] border-l border-[var(--card-border)]">
          <ThreadView
            parentMessage={activeThread}
            conversationId={conversation.id}
            currentUserId={currentUserId}
            onClose={() => setActiveThread(null)}
            allowReactions={conversation.allowReactions}
          />
        </div>
      )}

      {/* Call Interface */}
      {activeCall && (
        <CallInterface
          call={activeCall}
          currentUserId={currentUserId}
          onClose={clearActiveCall}
        />
      )}

      {/* Incoming Call Notification */}
      {incomingCall && !activeCall && (
        <IncomingCall
          call={incomingCall}
          onAccept={acceptCall}
          onDecline={dismissIncomingCall}
        />
      )}

      {/* Forward Message Modal */}
      {forwardingMessage && (
        <ForwardMessageModal
          message={forwardingMessage}
          onClose={() => setForwardingMessage(null)}
          onForwarded={() => setForwardingMessage(null)}
        />
      )}
    </div>
  );
}

// Enhanced Message Bubble with edit/delete/copy/star/forward actions
function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showTime,
  isFirstInGroup,
  isLastInGroup,
  isEditing,
  editContent,
  onEditContentChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onCopy,
  onReaction,
  onOpenThread,
  onStar,
  onForward,
  isStarred,
  allowReactions,
  allowThreads,
  currentUserId,
}: {
  message: MessageWithDetails;
  isOwn: boolean;
  showAvatar: boolean;
  showTime: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onReaction: (type: MessageReactionType) => void;
  onOpenThread: () => void;
  onStar: () => void;
  onForward: () => void;
  isStarred: boolean;
  allowReactions: boolean;
  allowThreads: boolean;
  currentUserId: string;
}) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const senderName = message.senderUser?.fullName || message.senderClient?.fullName || message.senderName;
  const senderInitials = (senderName || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  // Group reactions by type
  const reactionCounts = message.reactions.reduce(
    (acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    },
    {} as Record<MessageReactionType, number>
  );

  // Detect links for preview
  const links = message.content.match(URL_REGEX) || [];
  const hasLinks = links.length > 0;

  // Render content with clickable links
  const renderContent = (content: string) => {
    const parts = content.split(URL_REGEX);
    return parts.map((part, i) => {
      if (URL_REGEX.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline ${isOwn ? "text-white/90" : "text-[var(--primary)]"}`}
          >
            {part}
          </a>
        );
      }
      // Highlight @mentions
      const mentionParts = part.split(/(@\w+\s\w+)/g);
      return mentionParts.map((mp, j) => {
        if (mp.startsWith("@")) {
          return (
            <span key={`${i}-${j}`} className={`font-medium ${isOwn ? "text-white" : "text-[var(--primary)]"}`}>
              {mp}
            </span>
          );
        }
        return mp;
      });
    });
  };

  // Calculate bubble border radius based on position in group
  const getBubbleRadius = () => {
    if (isOwn) {
      if (isFirstInGroup && isLastInGroup) return "rounded-2xl rounded-br-md";
      if (isFirstInGroup) return "rounded-2xl rounded-br-md";
      if (isLastInGroup) return "rounded-2xl rounded-tr-md rounded-br-md";
      return "rounded-2xl rounded-tr-md rounded-br-md";
    } else {
      if (isFirstInGroup && isLastInGroup) return "rounded-2xl rounded-bl-md";
      if (isFirstInGroup) return "rounded-2xl rounded-bl-md";
      if (isLastInGroup) return "rounded-2xl rounded-tl-md rounded-bl-md";
      return "rounded-2xl rounded-tl-md rounded-bl-md";
    }
  };

  return (
    <div className={`message-row flex ${isOwn ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>
      {/* Avatar (for received messages) */}
      {!isOwn && (
        <div className="w-8 flex-shrink-0">
          {showAvatar && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xs font-medium">
              {senderInitials}
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`message-content max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {isEditing ? (
          // Edit Mode
          <div className="w-full" role="region" aria-label="Edit message">
            <label htmlFor={`edit-${message.id}`} className="sr-only">Edit message content</label>
            <textarea
              id={`edit-${message.id}`}
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="w-full rounded-lg border border-[var(--primary)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              rows={3}
              autoFocus
              aria-describedby={`edit-actions-${message.id}`}
            />
            <div id={`edit-actions-${message.id}`} className="mt-2 flex gap-2">
              <button
                onClick={onSaveEdit}
                className="rounded-lg bg-[var(--primary)] px-3 py-1 text-xs text-white hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
              >
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="rounded-lg border border-[var(--card-border)] px-3 py-1 text-xs text-[var(--foreground)] hover:bg-[var(--background-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`message-bubble group relative px-4 py-2 ${getBubbleRadius()} ${
                isOwn
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-tertiary)] text-[var(--foreground)]"
              }`}
              onMouseEnter={() => setShowActions(true)}
              onMouseLeave={() => { setShowActions(false); setShowReactionPicker(false); }}
            >
              {/* Message Text */}
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {renderContent(message.content)}
              </p>

              {message.isEdited && (
                <span className={`text-xs ${isOwn ? "text-white/60" : "text-[var(--foreground-muted)]"}`}>
                  {" "}(edited)
                </span>
              )}

              {/* Attachments */}
              {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {(message.attachments as MessageAttachment[]).map((attachment, i) => (
                    <div key={i}>
                      {attachment.type === "image" ? (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="max-w-full rounded-lg"
                        />
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 rounded-lg p-2 ${
                            isOwn ? "bg-white/10" : "bg-[var(--card)]"
                          }`}
                        >
                          <FileText className="h-5 w-5" />
                          <span className="text-sm truncate">{attachment.name}</span>
                          <Download className="h-4 w-4 ml-auto" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons on hover */}
              {showActions && (
                <div
                  className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 ${
                    isOwn ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"
                  }`}
                  role="toolbar"
                  aria-label="Message actions"
                >
                  {/* Reaction button */}
                  {allowReactions && (
                    <button
                      onClick={() => setShowReactionPicker(!showReactionPicker)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-sm hover:bg-[var(--background-hover)] transition-colors"
                      aria-label="Add reaction"
                      aria-haspopup="true"
                      aria-expanded={showReactionPicker}
                    >
                      <Smile className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                    </button>
                  )}

                  {/* Reply/Thread button */}
                  {allowThreads && (
                    <button
                      onClick={onOpenThread}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-sm hover:bg-[var(--background-hover)] transition-colors"
                      aria-label="Reply in thread"
                    >
                      <Reply className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                    </button>
                  )}

                  {/* Copy button */}
                  <button
                    onClick={onCopy}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-sm hover:bg-[var(--background-hover)] transition-colors"
                    aria-label="Copy message"
                  >
                    <Copy className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                  </button>

                  {/* Star button */}
                  <button
                    onClick={onStar}
                    className={`flex h-7 w-7 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-sm hover:bg-[var(--background-hover)] transition-colors ${
                      isStarred ? "text-yellow-500" : ""
                    }`}
                    aria-label={isStarred ? "Unstar message" : "Star message"}
                    aria-pressed={isStarred}
                  >
                    <Star className={`h-4 w-4 ${isStarred ? "fill-current" : "text-[var(--foreground-muted)]"}`} aria-hidden="true" />
                  </button>

                  {/* Forward button */}
                  <button
                    onClick={onForward}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-sm hover:bg-[var(--background-hover)] transition-colors"
                    aria-label="Forward message"
                  >
                    <Forward className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                  </button>

                  {/* Edit button (own messages only) */}
                  {isOwn && (
                    <button
                      onClick={onStartEdit}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-sm hover:bg-[var(--background-hover)] transition-colors"
                      aria-label="Edit message"
                    >
                      <Edit3 className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                    </button>
                  )}

                  {/* Delete button (own messages only) */}
                  {isOwn && (
                    <button
                      onClick={onDelete}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-sm hover:bg-[var(--error)]/10 transition-colors"
                      aria-label="Delete message"
                    >
                      <Trash2 className="h-4 w-4 text-[var(--error)]" aria-hidden="true" />
                    </button>
                  )}

                  {/* Reaction Picker */}
                  {showReactionPicker && (
                    <div
                      className={`absolute z-50 flex gap-0.5 rounded-full border border-[var(--card-border)] bg-[var(--card)] p-1 shadow-xl ${
                        isOwn ? "right-0 top-full mt-1" : "left-0 top-full mt-1"
                      }`}
                      role="menu"
                      aria-label="Reaction options"
                    >
                      {REACTION_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            onReaction(type);
                            setShowReactionPicker(false);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--background-hover)] transition-colors text-lg"
                          role="menuitem"
                          aria-label={`React with ${type.replace('_', ' ')}`}
                        >
                          {REACTION_EMOJIS[type]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Link Preview */}
            {hasLinks && links[0] && (
              <div className={`mt-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 max-w-xs ${isOwn ? "ml-auto" : ""}`}>
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <LinkIcon className="h-3 w-3" />
                  <span className="truncate">{(() => { try { return new URL(links[0]).hostname; } catch { return links[0]; } })()}</span>
                </div>
              </div>
            )}

            {/* Reactions Display */}
            {Object.keys(reactionCounts).length > 0 && (
              <div className={`mt-1 flex gap-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                {(Object.entries(reactionCounts) as [MessageReactionType, number][]).map(
                  ([type, count]) => (
                    <button
                      key={type}
                      onClick={() => onReaction(type)}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-2 py-0.5 text-xs hover:bg-[var(--background-hover)] shadow-sm"
                    >
                      <span>{REACTION_EMOJIS[type]}</span>
                      <span className="text-[var(--foreground-muted)]">{count}</span>
                    </button>
                  )
                )}
              </div>
            )}

            {/* Thread Count Indicator */}
            {allowThreads && message.threadCount > 0 && (
              <button
                onClick={onOpenThread}
                className={`mt-1 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors ${isOwn ? "ml-auto" : ""}`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{message.threadCount} {message.threadCount === 1 ? "reply" : "replies"}</span>
              </button>
            )}

            {/* Time & Read Status */}
            {showTime && (
              <div className={`mt-1 flex items-center gap-1.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                <span className="text-[11px] text-[var(--foreground-muted)]">
                  {format(new Date(message.createdAt), "h:mm a")}
                </span>
                {isOwn && (
                  <ReadReceiptsDisplay
                    receipts={message.readReceipts}
                    isOwn={isOwn}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Helper Functions
function getConversationDisplayName(
  conversation: ConversationWithDetails,
  currentUserId: string
): string {
  if (conversation.name) {
    return conversation.name;
  }

  if (conversation.type === "direct") {
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== currentUserId
    );
    return (
      otherParticipant?.user?.fullName ||
      otherParticipant?.client?.fullName ||
      "Unknown"
    );
  }

  if (conversation.type === "client_support") {
    return "Client Support";
  }

  return `${conversation.type.charAt(0).toUpperCase() + conversation.type.slice(1)} Chat`;
}

function groupMessagesByDate(messages: MessageWithDetails[]): Record<string, MessageWithDetails[]> {
  const groups: Record<string, MessageWithDetails[]> = {};

  messages.forEach((message) => {
    const date = new Date(message.createdAt);
    let dateKey: string;

    if (isToday(date)) {
      dateKey = "Today";
    } else if (isYesterday(date)) {
      dateKey = "Yesterday";
    } else {
      dateKey = format(date, "MMMM d, yyyy");
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  return groups;
}
