"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCheck, Eye } from "lucide-react";
import { format } from "date-fns";

interface ReadReceipt {
  userId: string | null;
  clientId: string | null;
  readAt: Date;
  user?: {
    id: string;
    fullName: string | null;
    avatarUrl?: string | null;
  } | null;
  client?: {
    id: string;
    fullName: string | null;
  } | null;
}

interface ReadReceiptsDisplayProps {
  receipts: ReadReceipt[];
  isOwn: boolean;
  className?: string;
}

export function ReadReceiptsDisplay({
  receipts,
  isOwn,
  className = "",
}: ReadReceiptsDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close tooltip on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

  if (receipts.length === 0) {
    // Show single check for sent (not delivered)
    return (
      <CheckCheck
        className={`h-3.5 w-3.5 text-[var(--foreground-muted)] ${className}`}
        aria-label="Message sent"
      />
    );
  }

  // Get unique readers
  const readers = receipts.map((r) => ({
    id: r.userId || r.clientId || "",
    name: r.user?.fullName || r.client?.fullName || "Unknown",
    avatar: r.user?.avatarUrl,
    readAt: new Date(r.readAt),
    initials: (r.user?.fullName || r.client?.fullName || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));

  // Limit displayed avatars
  const displayedReaders = readers.slice(0, 3);
  const remainingCount = readers.length - 3;

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        aria-label={`Read by ${readers.length} ${readers.length === 1 ? "person" : "people"}`}
        aria-expanded={showTooltip}
        aria-haspopup="true"
      >
        {/* Read indicator */}
        <CheckCheck className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" />

        {/* Small avatar stack */}
        {readers.length > 0 && (
          <div className="flex -space-x-1.5">
            {displayedReaders.map((reader, index) => (
              <div
                key={reader.id}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white text-[8px] font-medium border border-[var(--background)] ring-0"
                style={{ zIndex: displayedReaders.length - index }}
                title={reader.name}
              >
                {reader.avatar ? (
                  <img
                    src={reader.avatar}
                    alt={reader.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  reader.initials
                )}
              </div>
            ))}
            {remainingCount > 0 && (
              <div
                className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-muted)] text-[8px] font-medium border border-[var(--background)]"
                style={{ zIndex: 0 }}
              >
                +{remainingCount}
              </div>
            )}
          </div>
        )}
      </button>

      {/* Tooltip with full details */}
      {showTooltip && readers.length > 0 && (
        <div
          className={`absolute z-50 w-56 rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-2 shadow-xl ${
            isOwn ? "right-0 bottom-full mb-2" : "left-0 bottom-full mb-2"
          }`}
          role="tooltip"
        >
          <div className="px-3 pb-2 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
              <Eye className="h-3.5 w-3.5" />
              <span>Seen by {readers.length}</span>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {readers.map((reader) => (
              <div
                key={reader.id}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--background-hover)]"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white text-[10px] font-medium">
                  {reader.avatar ? (
                    <img
                      src={reader.avatar}
                      alt={reader.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    reader.initials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--foreground)] truncate">{reader.name}</p>
                  <p className="text-[10px] text-[var(--foreground-muted)]">
                    {format(reader.readAt, "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for inline use
interface CompactReadReceiptsProps {
  readCount: number;
  isOwn: boolean;
}

export function CompactReadReceipts({ readCount, isOwn }: CompactReadReceiptsProps) {
  if (readCount === 0) {
    return (
      <CheckCheck
        className="h-3.5 w-3.5 text-[var(--foreground-muted)]"
        aria-label="Message sent"
      />
    );
  }

  return (
    <div className="inline-flex items-center gap-1" aria-label={`Read by ${readCount}`}>
      <CheckCheck className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" />
      {readCount > 1 && (
        <span className="text-[10px] text-[var(--primary)]">{readCount}</span>
      )}
    </div>
  );
}
