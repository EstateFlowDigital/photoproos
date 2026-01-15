"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { PlatformId } from "../types";
import {
  getPlatformCharacterLimit,
  getPlatformHashtagLimit,
  getSuggestedHashtags,
} from "@/lib/marketing-studio/platforms";
import { Hash, Smile, AtSign, Sparkles, X } from "lucide-react";

interface CaptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  platform: PlatformId;
  industry?: string;
  placeholder?: string;
  className?: string;
}

// Common photography emojis
const COMMON_EMOJIS = [
  "\u{1F4F7}", // camera
  "\u{1F4F8}", // camera with flash
  "\u{2728}", // sparkles
  "\u{1F31F}", // glowing star
  "\u{1F495}", // two hearts
  "\u{1F4AB}", // dizzy
  "\u{1F3A8}", // artist palette
  "\u{1F4CD}", // round pushpin
  "\u{2764}\u{FE0F}", // red heart
  "\u{1F44D}", // thumbs up
  "\u{1F60D}", // heart eyes
  "\u{1F525}", // fire
];

export function CaptionEditor({
  value,
  onChange,
  platform,
  industry,
  placeholder = "Write your caption...",
  className,
}: CaptionEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [showHashtags, setShowHashtags] = React.useState(false);

  const characterLimit = getPlatformCharacterLimit(platform);
  const hashtagLimit = getPlatformHashtagLimit(platform);
  const suggestedHashtags = getSuggestedHashtags(industry);

  // Count characters (excluding whitespace-only lines)
  const characterCount = value.length;
  const isOverLimit = characterCount > characterLimit;

  // Count hashtags
  const hashtagMatches = value.match(/#\w+/g) || [];
  const hashtagCount = hashtagMatches.length;
  const isOverHashtagLimit = hashtagCount > hashtagLimit;

  // Insert text at cursor position
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    onChange(newValue);

    // Move cursor after inserted text
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  // Add hashtag
  const addHashtag = (hashtag: string) => {
    if (hashtagCount >= hashtagLimit) return;

    // Check if hashtag already exists
    if (value.includes(hashtag)) return;

    // Add with proper spacing
    const needsNewline = value.length > 0 && !value.endsWith("\n") && !value.endsWith(" ");
    const prefix = needsNewline ? "\n\n" : value.length > 0 && !value.endsWith(" ") ? " " : "";
    insertAtCursor(prefix + hashtag);
  };

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  }, [value]);

  return (
    <div className={cn("caption-editor", className)}>
      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full min-h-[120px] rounded-lg border bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none",
            isOverLimit ? "border-red-500" : "border-[var(--border)]"
          )}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-2">
          {/* Emoji picker toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowHashtags(false);
              }}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors",
                showEmojiPicker
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
              )}
            >
              <Smile className="h-4 w-4" />
            </button>

            {/* Emoji picker dropdown */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 p-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-lg z-10">
                <div className="grid grid-cols-6 gap-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        insertAtCursor(emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="h-8 w-8 flex items-center justify-center text-lg hover:bg-[var(--background-hover)] rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hashtag suggestions toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowHashtags(!showHashtags);
                setShowEmojiPicker(false);
              }}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors",
                showHashtags
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
              )}
            >
              <Hash className="h-4 w-4" />
              <span>Hashtags</span>
            </button>

            {/* Hashtag suggestions dropdown */}
            {showHashtags && (
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-lg z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    Suggested Hashtags
                  </span>
                  <button
                    onClick={() => setShowHashtags(false)}
                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedHashtags.map((hashtag) => {
                    const isAdded = value.includes(hashtag);
                    return (
                      <button
                        key={hashtag}
                        onClick={() => !isAdded && addHashtag(hashtag)}
                        disabled={isAdded || hashtagCount >= hashtagLimit}
                        className={cn(
                          "rounded-full px-2 py-1 text-xs transition-colors",
                          isAdded
                            ? "bg-[var(--primary)]/20 text-[var(--primary)] cursor-default"
                            : hashtagCount >= hashtagLimit
                            ? "bg-[var(--background-hover)] text-[var(--foreground-muted)] cursor-not-allowed"
                            : "bg-[var(--background-hover)] text-[var(--foreground)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                        )}
                      >
                        {hashtag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mention button */}
          <button
            onClick={() => insertAtCursor("@")}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] transition-colors"
          >
            <AtSign className="h-4 w-4" />
          </button>
        </div>

        {/* Character and hashtag counts */}
        <div className="flex items-center gap-3 text-xs">
          {/* Hashtag count */}
          <span
            className={cn(
              "flex items-center gap-1",
              isOverHashtagLimit ? "text-red-500" : "text-[var(--foreground-muted)]"
            )}
          >
            <Hash className="h-3 w-3" />
            {hashtagCount}/{hashtagLimit}
          </span>

          {/* Character count */}
          <span
            className={cn(
              isOverLimit ? "text-red-500 font-medium" : "text-[var(--foreground-muted)]"
            )}
          >
            {characterCount.toLocaleString()}/{characterLimit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Warning messages */}
      {(isOverLimit || isOverHashtagLimit) && (
        <div className="mt-2 space-y-1">
          {isOverLimit && (
            <p className="text-xs text-red-500">
              Caption exceeds the {characterLimit.toLocaleString()} character limit for {platform}
            </p>
          )}
          {isOverHashtagLimit && (
            <p className="text-xs text-red-500">
              Too many hashtags. Maximum {hashtagLimit} allowed for {platform}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
