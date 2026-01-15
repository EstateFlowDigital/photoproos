"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Wand2,
  AlertCircle,
  Copy,
} from "lucide-react";

interface AIAssistantProps {
  field: string;
  currentValue?: string;
  context: {
    pageType: string;
    pageTitle?: string;
    topic?: string;
    industry?: string;
    tone?: "professional" | "casual" | "friendly" | "formal";
  };
  onApply: (value: string) => void;
  className?: string;
}

interface GenerateResponse {
  suggestions: string[];
  source: "anthropic" | "mock";
}

/**
 * AI Assistant component for generating content suggestions
 */
export function AIAssistant({
  field,
  currentValue,
  context,
  onApply,
  className,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"anthropic" | "mock" | null>(null);

  const generateSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cms/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          currentValue,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate suggestions");
      }

      const data = (await response.json()) as GenerateResponse;
      setSuggestions(data.suggestions);
      setSource(data.source);
    } catch (err) {
      setError("Failed to generate suggestions. Please try again.");
      console.error("AI generation error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [field, currentValue, context]);

  const handleToggle = () => {
    if (!isOpen && suggestions.length === 0) {
      generateSuggestions();
    }
    setIsOpen(!isOpen);
  };

  const handleApply = (suggestion: string) => {
    onApply(suggestion);
    setIsOpen(false);
  };

  const handleCopy = (suggestion: string) => {
    navigator.clipboard.writeText(suggestion);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
          "text-xs font-medium transition-colors",
          isOpen
            ? "bg-[var(--ai)] text-white"
            : "bg-[var(--ai)]/10 text-[var(--ai)] hover:bg-[var(--ai)]/20",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-expanded={isOpen}
        aria-label="AI suggestions"
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
        )}
        <span>AI</span>
        {isOpen ? (
          <ChevronUp className="w-3 h-3" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-3 h-3" aria-hidden="true" />
        )}
      </button>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 top-full right-0 mt-2 w-80",
            "bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg",
            "overflow-hidden"
          )}
          role="listbox"
          aria-label="AI suggestions"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--background-elevated)] border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[var(--ai)]" aria-hidden="true" />
              <span className="text-sm font-medium text-[var(--foreground)]">
                AI Suggestions
              </span>
              {source === "mock" && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500">
                  Demo
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-[var(--background)] transition-colors"
              aria-label="Close suggestions"
            >
              <X className="w-4 h-4 text-[var(--foreground-muted)]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
            {error && (
              <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--ai)] mb-3" />
                <p className="text-sm text-[var(--foreground-muted)]">
                  Generating suggestions...
                </p>
              </div>
            )}

            {!isLoading && suggestions.length === 0 && !error && (
              <div className="text-center py-6">
                <Sparkles className="w-8 h-8 text-[var(--foreground-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--foreground-muted)]">
                  No suggestions yet
                </p>
              </div>
            )}

            {!isLoading && suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                suggestion={suggestion}
                onApply={() => handleApply(suggestion)}
                onCopy={() => handleCopy(suggestion)}
              />
            ))}
          </div>

          {/* Footer */}
          {!isLoading && (
            <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--background)]">
              <button
                onClick={generateSuggestions}
                disabled={isLoading}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg",
                  "text-xs font-medium transition-colors",
                  "bg-[var(--ai)]/10 text-[var(--ai)] hover:bg-[var(--ai)]/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Individual suggestion item
 */
function SuggestionItem({
  suggestion,
  onApply,
  onCopy,
}: {
  suggestion: string;
  onApply: () => void;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group p-3 rounded-lg border border-[var(--border)]",
        "hover:border-[var(--ai)]/50 hover:bg-[var(--ai)]/5",
        "transition-colors cursor-pointer"
      )}
      role="option"
    >
      <p className="text-sm text-[var(--foreground)] mb-2 leading-relaxed">
        {suggestion}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onApply}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
            "bg-[var(--ai)] text-white hover:bg-[var(--ai)]/90",
            "transition-colors"
          )}
        >
          <Check className="w-3 h-3" />
          Apply
        </button>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
            "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
            "hover:bg-[var(--background-elevated)] transition-colors"
          )}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * AI field wrapper - wraps an input field with AI suggestion button
 */
export function AIFieldWrapper({
  field,
  currentValue,
  context,
  onApply,
  children,
  className,
}: AIAssistantProps & { children: React.ReactNode }) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute top-0 right-0">
        <AIAssistant
          field={field}
          currentValue={currentValue}
          context={context}
          onApply={onApply}
        />
      </div>
    </div>
  );
}

/**
 * Inline AI button for compact use
 */
export function AIButton({
  field,
  currentValue,
  context,
  onApply,
  className,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = async () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      const response = await fetch("/api/cms/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, currentValue, context }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error("AI generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        onClick={generateSuggestions}
        disabled={isLoading}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          "text-[var(--ai)] hover:bg-[var(--ai)]/10",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        title="AI suggestions"
        aria-label="Get AI suggestions"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </button>

      {isOpen && suggestions.length > 0 && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className={cn(
              "absolute z-50 top-full right-0 mt-1 w-72",
              "bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg",
              "p-2 space-y-1"
            )}
          >
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  onApply(suggestion);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm",
                  "hover:bg-[var(--ai)]/10 transition-colors",
                  "text-[var(--foreground)]"
                )}
              >
                {suggestion}
              </button>
            ))}
            <button
              onClick={() => {
                setSuggestions([]);
                generateSuggestions();
              }}
              className={cn(
                "w-full flex items-center justify-center gap-1 px-3 py-1.5",
                "text-xs text-[var(--foreground-muted)] hover:text-[var(--ai)]",
                "transition-colors"
              )}
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Hook for using AI suggestions programmatically
 */
export function useAISuggestions() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (
      field: string,
      context: AIAssistantProps["context"],
      currentValue?: string
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/cms/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field, currentValue, context }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate suggestions");
        }

        const data = await response.json();
        setSuggestions(data.suggestions);
        return data.suggestions;
      } catch (err) {
        setError("Failed to generate suggestions");
        console.error("AI generation error:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    isLoading,
    suggestions,
    error,
    generate,
    clear,
  };
}
