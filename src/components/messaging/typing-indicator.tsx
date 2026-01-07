"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getTypingUsers, updateTypingStatus, clearTypingStatus } from "@/lib/actions/typing-indicators";
import type { TypingUser } from "@/lib/actions/typing-indicators";

interface TypingIndicatorProps {
  conversationId: string;
  className?: string;
}

// Animated dots component
function AnimatedDots() {
  return (
    <span className="typing-dots inline-flex gap-0.5 ml-1">
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--foreground-muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--foreground-muted)] animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--foreground-muted)] animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

export function TypingIndicator({ conversationId, className = "" }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // Poll for typing users
  useEffect(() => {
    const fetchTypingUsers = async () => {
      const result = await getTypingUsers(conversationId);
      if (result.success) {
        setTypingUsers(result.data);
      }
    };

    // Initial fetch
    fetchTypingUsers();

    // Poll every 2 seconds
    const interval = setInterval(fetchTypingUsers, 2000);

    return () => clearInterval(interval);
  }, [conversationId]);

  if (typingUsers.length === 0) {
    return null;
  }

  // Format typing text
  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return (
        <>
          <span className="font-medium">{typingUsers[0].userName}</span> is typing
        </>
      );
    } else if (typingUsers.length === 2) {
      return (
        <>
          <span className="font-medium">{typingUsers[0].userName}</span> and{" "}
          <span className="font-medium">{typingUsers[1].userName}</span> are typing
        </>
      );
    } else {
      return (
        <>
          <span className="font-medium">{typingUsers.length}</span> people are typing
        </>
      );
    }
  };

  return (
    <div className={`typing-indicator flex items-center gap-2 px-4 py-2 text-sm text-[var(--foreground-muted)] ${className}`}>
      {/* Avatar stack */}
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map((user, index) => (
          <div
            key={user.userId}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white text-[10px] font-medium border-2 border-[var(--card)]"
            style={{ zIndex: 3 - index }}
            title={user.userName}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.userName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              user.userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
            )}
          </div>
        ))}
      </div>

      {/* Typing text */}
      <span>
        {getTypingText()}
        <AnimatedDots />
      </span>
    </div>
  );
}

// Hook to manage typing status
interface UseTypingIndicatorOptions {
  conversationId: string;
  debounceMs?: number;
  timeoutMs?: number;
}

export function useTypingIndicator({
  conversationId,
  debounceMs = 500,
  timeoutMs = 3000,
}: UseTypingIndicatorOptions) {
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stopTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Send typing update to server
  const sendTypingUpdate = useCallback(
    async (typing: boolean) => {
      // Debounce rapid updates
      const now = Date.now();
      if (typing && now - lastUpdateRef.current < debounceMs) {
        return;
      }
      lastUpdateRef.current = now;

      await updateTypingStatus(conversationId, typing);
    },
    [conversationId, debounceMs]
  );

  // Handle input change
  const handleTyping = useCallback(() => {
    // Clear existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
    }

    // Start typing if not already
    if (!isTyping) {
      setIsTyping(true);
      sendTypingUpdate(true);
    }

    // Set timer to stop typing after timeout
    stopTypingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingUpdate(false);
    }, timeoutMs);
  }, [isTyping, sendTypingUpdate, timeoutMs]);

  // Stop typing (call when message is sent or user stops)
  const stopTyping = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
    }

    setIsTyping(false);
    clearTypingStatus(conversationId);
  }, [conversationId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (stopTypingTimerRef.current) {
        clearTimeout(stopTypingTimerRef.current);
      }
      // Clear typing status when component unmounts
      clearTypingStatus(conversationId);
    };
  }, [conversationId]);

  return {
    isTyping,
    handleTyping,
    stopTyping,
  };
}

// Inline typing indicator for message list
interface InlineTypingIndicatorProps {
  typingUsers: TypingUser[];
}

export function InlineTypingIndicator({ typingUsers }: InlineTypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  return (
    <div className="inline-typing-indicator flex items-center gap-3 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background-tertiary)]">
        <AnimatedDots />
      </div>
      <span className="text-sm text-[var(--foreground-muted)]">
        {typingUsers.length === 1
          ? `${typingUsers[0].userName} is typing...`
          : typingUsers.length === 2
          ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
          : `${typingUsers.length} people are typing...`}
      </span>
    </div>
  );
}
