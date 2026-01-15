"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { PlatformId } from "../types";
import {
  getPlatformCharacterLimit,
  getPlatformHashtagLimit,
  getSuggestedHashtags,
} from "@/lib/marketing-studio/platforms";
import {
  generateCaption,
  type CaptionTone,
  type CaptionLength,
  type GeneratedCaption,
} from "@/lib/marketing-studio/ai-captions";
import { Hash, Smile, AtSign, Sparkles, X, Loader2, RefreshCw, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";

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

// Tone options for AI generation
const TONE_OPTIONS: { value: CaptionTone; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Polished and business-appropriate" },
  { value: "casual", label: "Casual", description: "Friendly and conversational" },
  { value: "inspirational", label: "Inspirational", description: "Uplifting and motivational" },
  { value: "educational", label: "Educational", description: "Informative and instructive" },
  { value: "promotional", label: "Promotional", description: "Sales-focused with CTAs" },
  { value: "storytelling", label: "Storytelling", description: "Narrative and engaging" },
];

// Length options for AI generation
const LENGTH_OPTIONS: { value: CaptionLength; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
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

  // AI Generator state
  const [showAIGenerator, setShowAIGenerator] = React.useState(false);
  const [aiTone, setAiTone] = React.useState<CaptionTone>("professional");
  const [aiLength, setAiLength] = React.useState<CaptionLength>("medium");
  const [aiIncludeHashtags, setAiIncludeHashtags] = React.useState(true);
  const [aiIncludeEmoji, setAiIncludeEmoji] = React.useState(true);
  const [aiIncludeCta, setAiIncludeCta] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedCaption, setGeneratedCaption] = React.useState<GeneratedCaption | null>(null);

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

  // Generate AI caption
  const handleGenerateCaption = React.useCallback(async () => {
    setIsGenerating(true);
    try {
      const result = await generateCaption({
        platform,
        industry: industry || "commercial",
        tone: aiTone,
        length: aiLength,
        includeHashtags: aiIncludeHashtags,
        includeEmoji: aiIncludeEmoji,
        includeCallToAction: aiIncludeCta,
      });
      setGeneratedCaption(result);
    } catch (error) {
      console.error("Error generating caption:", error);
      toast.error("Failed to generate caption");
    } finally {
      setIsGenerating(false);
    }
  }, [platform, industry, aiTone, aiLength, aiIncludeHashtags, aiIncludeEmoji, aiIncludeCta]);

  // Apply generated caption
  const handleApplyCaption = React.useCallback(() => {
    if (generatedCaption) {
      onChange(generatedCaption.text);
      setShowAIGenerator(false);
      setGeneratedCaption(null);
      toast.success("Caption applied");
    }
  }, [generatedCaption, onChange]);

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
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            aria-label="Insert mention"
          >
            <AtSign className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* AI Generator button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAIGenerator(!showAIGenerator);
                setShowEmojiPicker(false);
                setShowHashtags(false);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ai)]",
                showAIGenerator
                  ? "bg-[var(--ai)]/10 text-[var(--ai)]"
                  : "text-[var(--ai)] hover:bg-[var(--ai)]/10"
              )}
              aria-label="Generate caption with AI"
              aria-expanded={showAIGenerator}
              aria-haspopup="dialog"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>AI</span>
            </button>
          </div>
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

      {/* AI Generator Panel */}
      {showAIGenerator && (
        <div
          className="mt-3 rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-4"
          role="dialog"
          aria-label="AI Caption Generator"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--ai)]" aria-hidden="true" />
              <span className="text-sm font-medium text-[var(--foreground)]">AI Caption Generator</span>
            </div>
            <button
              onClick={() => {
                setShowAIGenerator(false);
                setGeneratedCaption(null);
              }}
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded p-1"
              aria-label="Close AI generator"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Tone Selector */}
            <div>
              <label htmlFor="ai-tone" className="block text-xs text-[var(--foreground-muted)] mb-1.5">
                Tone
              </label>
              <div className="relative">
                <select
                  id="ai-tone"
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value as CaptionTone)}
                  className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 pr-8 text-sm text-[var(--foreground)] focus:border-[var(--ai)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ai)] cursor-pointer"
                >
                  {TONE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {/* Length Selector */}
            <div>
              <label id="ai-length-label" className="block text-xs text-[var(--foreground-muted)] mb-1.5">
                Length
              </label>
              <div
                className="flex items-center gap-1"
                role="group"
                aria-labelledby="ai-length-label"
              >
                {LENGTH_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAiLength(option.value)}
                    aria-pressed={aiLength === option.value}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ai)]",
                      aiLength === option.value
                        ? "bg-[var(--ai)] text-white"
                        : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiIncludeHashtags}
                  onChange={(e) => setAiIncludeHashtags(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--ai)] focus:ring-[var(--ai)]"
                />
                <span className="text-xs text-[var(--foreground)]">Include hashtags</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiIncludeEmoji}
                  onChange={(e) => setAiIncludeEmoji(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--ai)] focus:ring-[var(--ai)]"
                />
                <span className="text-xs text-[var(--foreground)]">Include emoji</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiIncludeCta}
                  onChange={(e) => setAiIncludeCta(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--ai)] focus:ring-[var(--ai)]"
                />
                <span className="text-xs text-[var(--foreground)]">Include call-to-action</span>
              </label>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateCaption}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--ai)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ai)] focus-visible:ring-offset-2 transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Generate Caption
                </>
              )}
            </button>
          </div>

          {/* Generated Caption Preview */}
          {generatedCaption && (
            <div className="mt-4 pt-4 border-t border-[var(--ai)]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--foreground)]">Generated Caption</span>
                <span className="text-xs text-[var(--ai)] capitalize">{generatedCaption.tone}</span>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 mb-3">
                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{generatedCaption.text}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyCaption}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[var(--ai)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ai)] focus-visible:ring-offset-2 transition-colors"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Use this caption
                </button>
                <button
                  onClick={handleGenerateCaption}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-colors"
                  aria-label="Generate another caption"
                >
                  <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
