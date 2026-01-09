"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Copy, Check, AlertTriangle, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { getDevSettings } from "@/lib/utils/dev-settings";

interface StackFrame {
  fileName: string;
  lineNumber: number | null;
  columnNumber: number | null;
  functionName: string | null;
  source: string;
}

interface TrackedError {
  id: string;
  message: string;
  name: string;
  stack: StackFrame[];
  rawStack: string;
  timestamp: number;
  url: string;
  componentStack?: string;
  type: "error" | "unhandledrejection" | "react";
}

// Parse a stack trace string into structured frames
function parseStackTrace(stack: string): StackFrame[] {
  if (!stack) return [];

  const frames: StackFrame[] = [];
  const lines = stack.split("\n");

  for (const line of lines) {
    // Skip the error message line
    if (!line.includes("at ") && !line.match(/^\s+at /)) continue;

    // Pattern: "at functionName (file:line:column)" or "at file:line:column"
    const match = line.match(
      /at\s+(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+)|(.+?):(\d+))\)?/
    );

    if (match) {
      const functionName = match[1] || null;
      const fileName = match[2] || match[5] || "unknown";
      const lineNumber = match[3] || match[6];
      const columnNumber = match[4] || null;

      frames.push({
        fileName: cleanFileName(fileName),
        lineNumber: lineNumber ? parseInt(lineNumber, 10) : null,
        columnNumber: columnNumber ? parseInt(columnNumber, 10) : null,
        functionName,
        source: line.trim(),
      });
    }
  }

  return frames;
}

// Clean up webpack/next.js internal paths
function cleanFileName(fileName: string): string {
  // Remove webpack internal paths
  if (fileName.includes("webpack-internal:///")) {
    return fileName.replace(/webpack-internal:\/\/\/\(.*?\)\//, "");
  }
  // Remove node_modules paths - just show package name
  if (fileName.includes("node_modules")) {
    const match = fileName.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
    if (match) return `[${match[1]}]`;
  }
  // Remove full paths, keep relative
  if (fileName.includes("/src/")) {
    return fileName.substring(fileName.indexOf("/src/") + 1);
  }
  return fileName;
}

// Check if a frame is from user code (not node_modules/internal)
function isUserCode(frame: StackFrame): boolean {
  return (
    !frame.fileName.includes("node_modules") &&
    !frame.fileName.includes("[") &&
    !frame.fileName.includes("webpack") &&
    !frame.fileName.startsWith("internal/") &&
    frame.fileName.includes("src/")
  );
}

export function ErrorTracker() {
  const [errors, setErrors] = useState<TrackedError[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState(true);
  const errorCountRef = useRef(0);

  // Load visibility setting
  useEffect(() => {
    const loadSettings = () => {
      const settings = getDevSettings();
      setHidden(settings.hideDebugBanner);
    };
    loadSettings();

    const handleChange = () => loadSettings();
    window.addEventListener("ppos_dev_settings_changed", handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener("ppos_dev_settings_changed", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  // Capture errors
  const captureError = useCallback(
    (
      error: Error,
      type: "error" | "unhandledrejection" | "react",
      componentStack?: string
    ) => {
      const id = `${Date.now()}-${++errorCountRef.current}`;
      const tracked: TrackedError = {
        id,
        message: error.message || String(error),
        name: error.name || "Error",
        stack: parseStackTrace(error.stack || ""),
        rawStack: error.stack || "",
        timestamp: Date.now(),
        url: window.location.pathname,
        componentStack,
        type,
      };

      setErrors((prev) => [tracked, ...prev].slice(0, 50));
      setIsOpen(true); // Auto-open on error
      setExpandedErrors((prev) => new Set(prev).add(id));
    },
    []
  );

  // Set up global error handlers
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      captureError(
        event.error || new Error(event.message),
        "error"
      );
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
      captureError(error, "unhandledrejection");
    };

    // Capture React errors via console.error override
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);

      // Check for React error boundary messages
      const message = args[0];
      if (
        typeof message === "string" &&
        (message.includes("React error") ||
          message.includes("in component") ||
          message.includes("render error"))
      ) {
        const error = args.find((a) => a instanceof Error);
        const componentStack = args.find(
          (a) => typeof a === "string" && a.includes("at ")
        );
        if (error) {
          captureError(error, "react", componentStack);
        }
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      console.error = originalConsoleError;
    };
  }, [captureError]);

  const toggleExpanded = (id: string) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearErrors = () => {
    setErrors([]);
    setExpandedErrors(new Set());
  };

  const copyError = async (error: TrackedError) => {
    const userFrames = error.stack.filter(isUserCode);
    const firstUserFrame = userFrames[0];

    const text = `## Error Report

**Error:** ${error.name}: ${error.message}
**Page:** ${error.url}
**Time:** ${new Date(error.timestamp).toLocaleString()}
**Type:** ${error.type}

### Location
${
  firstUserFrame
    ? `**File:** \`${firstUserFrame.fileName}\`
**Line:** ${firstUserFrame.lineNumber}${firstUserFrame.columnNumber ? `:${firstUserFrame.columnNumber}` : ""}
**Function:** ${firstUserFrame.functionName || "(anonymous)"}`
    : "Could not determine source location"
}

### Stack Trace (User Code)
\`\`\`
${userFrames.map((f) => `at ${f.functionName || "(anonymous)"} (${f.fileName}:${f.lineNumber}:${f.columnNumber})`).join("\n") || "No user code frames"}
\`\`\`

### Full Stack
\`\`\`
${error.rawStack}
\`\`\`
${error.componentStack ? `\n### React Component Stack\n\`\`\`\n${error.componentStack}\n\`\`\`` : ""}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAllErrors = async () => {
    const text = errors
      .map((error) => {
        const userFrames = error.stack.filter(isUserCode);
        const firstUserFrame = userFrames[0];
        return `## ${error.name}: ${error.message}
Location: ${firstUserFrame ? `${firstUserFrame.fileName}:${firstUserFrame.lineNumber}` : "unknown"}
Page: ${error.url}
Time: ${new Date(error.timestamp).toLocaleString()}
Stack:
${error.rawStack}
---`;
      })
      .join("\n\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (hidden) return null;

  return (
    <>
      {/* Error Badge - Shows when errors exist but panel is closed */}
      {!isOpen && errors.length > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-20 z-[10000] flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--error)] text-white text-sm font-medium shadow-lg animate-pulse"
        >
          <AlertTriangle className="w-4 h-4" />
          {errors.length} Error{errors.length !== 1 ? "s" : ""}
        </button>
      )}

      {/* Error Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-[10001] w-[480px] max-h-[70vh] overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-[var(--border)] bg-[var(--error)]/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--error)]" />
              <h3 className="font-semibold text-[var(--foreground)] text-sm">
                Error Tracker
              </h3>
              {errors.length > 0 && (
                <span className="text-xs bg-[var(--error)] text-white px-1.5 py-0.5 rounded-full">
                  {errors.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {errors.length > 0 && (
                <>
                  <button
                    onClick={copyAllErrors}
                    className="p-1.5 rounded hover:bg-[var(--background-elevated)] text-[var(--foreground-muted)] text-xs"
                    title="Copy all errors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={clearErrors}
                    className="p-1.5 rounded hover:bg-[var(--background-elevated)] text-[var(--foreground-muted)]"
                    title="Clear all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded hover:bg-[var(--background-elevated)] text-[var(--foreground-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Error List */}
          <div className="flex-1 overflow-y-auto">
            {errors.length === 0 ? (
              <div className="p-6 text-center text-[var(--foreground-muted)] text-sm">
                No errors captured yet. Errors will appear here automatically.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {errors.map((error) => {
                  const isExpanded = expandedErrors.has(error.id);
                  const userFrames = error.stack.filter(isUserCode);
                  const firstUserFrame = userFrames[0];

                  return (
                    <div key={error.id} className="p-3">
                      {/* Error Header */}
                      <button
                        onClick={() => toggleExpanded(error.id)}
                        className="w-full text-left flex items-start gap-2"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 mt-0.5 text-[var(--foreground-muted)] flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mt-0.5 text-[var(--foreground-muted)] flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-[var(--error)]">
                              {error.name}
                            </span>
                            <span className="text-xs text-[var(--foreground-muted)]">
                              {new Date(error.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--foreground)] mt-0.5 break-words">
                            {error.message}
                          </p>
                          {firstUserFrame && (
                            <p className="text-xs text-[var(--primary)] mt-1 font-mono">
                              {firstUserFrame.fileName}:{firstUserFrame.lineNumber}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyError(error);
                          }}
                          className="p-1 rounded hover:bg-[var(--background-elevated)] text-[var(--foreground-muted)] flex-shrink-0"
                          title="Copy error for Claude"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-3 ml-6 space-y-3">
                          {/* Location */}
                          {firstUserFrame && (
                            <div className="bg-[var(--background-tertiary)] rounded-lg p-3">
                              <p className="text-xs font-medium text-[var(--foreground-muted)] mb-1">
                                Error Location
                              </p>
                              <p className="text-sm font-mono text-[var(--foreground)]">
                                {firstUserFrame.fileName}
                              </p>
                              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                Line {firstUserFrame.lineNumber}
                                {firstUserFrame.columnNumber &&
                                  `, Column ${firstUserFrame.columnNumber}`}
                                {firstUserFrame.functionName &&
                                  ` in ${firstUserFrame.functionName}()`}
                              </p>
                            </div>
                          )}

                          {/* User Code Stack */}
                          {userFrames.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-[var(--foreground-muted)] mb-1">
                                Stack Trace (Your Code)
                              </p>
                              <div className="bg-[var(--background-tertiary)] rounded-lg p-2 space-y-1 font-mono text-xs">
                                {userFrames.slice(0, 5).map((frame, i) => (
                                  <div
                                    key={i}
                                    className={`${i === 0 ? "text-[var(--error)]" : "text-[var(--foreground-muted)]"}`}
                                  >
                                    <span className="text-[var(--foreground-secondary)]">
                                      {frame.functionName || "(anonymous)"}
                                    </span>
                                    <span className="text-[var(--primary)] ml-2">
                                      {frame.fileName}:{frame.lineNumber}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Page URL */}
                          <p className="text-xs text-[var(--foreground-muted)]">
                            Page: {error.url}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-[var(--border)] bg-[var(--background-tertiary)]">
            <p className="text-xs text-[var(--foreground-muted)] text-center">
              Click Copy to get Claude-ready error report
            </p>
          </div>
        </div>
      )}
    </>
  );
}
