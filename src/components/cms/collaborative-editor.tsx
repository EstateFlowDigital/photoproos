"use client";

import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import {
  startCollabSession,
  endCollabSession,
  syncCollabSession,
  type CollabSession,
  type CollabParticipant,
  type CursorPosition,
} from "@/lib/actions/cms-collaboration";
import { Users, Circle, User } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface CollabUser {
  id: string;
  name: string;
  avatar?: string;
}

interface CollabContextValue {
  session: CollabSession | null;
  participants: CollabParticipant[];
  currentUser: CollabUser | null;
  isConnected: boolean;
  updateCursor: (field: string, offset: number, selection?: { start: number; end: number }) => void;
  clearCursor: () => void;
}

interface CollaborativeEditorProps {
  entityType: string;
  entityId: string;
  user: CollabUser;
  children: React.ReactNode;
  pollInterval?: number;
  className?: string;
}

interface ParticipantAvatarsProps {
  participants: CollabParticipant[];
  currentUserId?: string;
  maxVisible?: number;
  className?: string;
}

interface CursorOverlayProps {
  participant: CollabParticipant;
  field: string;
  className?: string;
}

interface CollabStatusProps {
  isConnected: boolean;
  participantCount: number;
  className?: string;
}

// ============================================================================
// CONTEXT
// ============================================================================

const CollabContext = createContext<CollabContextValue | null>(null);

export function useCollab(): CollabContextValue {
  const context = useContext(CollabContext);
  if (!context) {
    throw new Error("useCollab must be used within a CollaborativeEditor");
  }
  return context;
}

export function useCollabOptional(): CollabContextValue | null {
  return useContext(CollabContext);
}

// ============================================================================
// COLLABORATIVE EDITOR PROVIDER
// ============================================================================

export function CollaborativeEditor({
  entityType,
  entityId,
  user,
  children,
  pollInterval = 2000,
  className,
}: CollaborativeEditorProps) {
  const [session, setSession] = useState<CollabSession | null>(null);
  const [participants, setParticipants] = useState<CollabParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentCursor, setCurrentCursor] = useState<CursorPosition | null>(null);
  const versionRef = useRef(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // Join session on mount
  useEffect(() => {
    let mounted = true;

    async function join() {
      try {
        const result = await startCollabSession(entityType, entityId, user);
        if (result.success && result.data && mounted) {
          setSession(result.data.session);
          setParticipants(result.data.session.participants);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to join collab session:", error);
      }
    }

    join();

    return () => {
      mounted = false;
      if (session) {
        endCollabSession(session.id, user.id);
      }
    };
  }, [entityType, entityId, user.id]);

  // Poll for updates
  useEffect(() => {
    if (!session || !isConnected) return;

    async function poll() {
      try {
        const result = await syncCollabSession(
          session!.id,
          user.id,
          versionRef.current,
          currentCursor
        );

        if (result.success && result.data) {
          setParticipants(result.data.participants);
          versionRef.current = result.data.currentVersion;
        }
      } catch (error) {
        console.error("Poll error:", error);
        setIsConnected(false);
      }
    }

    // Initial poll
    poll();

    // Start polling interval
    pollIntervalRef.current = setInterval(poll, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [session, isConnected, user.id, pollInterval, currentCursor]);

  // Leave session on unmount
  useEffect(() => {
    return () => {
      if (session) {
        endCollabSession(session.id, user.id);
      }
    };
  }, []);

  const updateCursor = useCallback(
    (field: string, offset: number, selection?: { start: number; end: number }) => {
      setCurrentCursor({
        field,
        offset,
        selectionStart: selection?.start,
        selectionEnd: selection?.end,
      });
    },
    []
  );

  const clearCursor = useCallback(() => {
    setCurrentCursor(null);
  }, []);

  const contextValue: CollabContextValue = {
    session,
    participants,
    currentUser: user,
    isConnected,
    updateCursor,
    clearCursor,
  };

  return (
    <CollabContext.Provider value={contextValue}>
      <div className={cn("relative", className)}>{children}</div>
    </CollabContext.Provider>
  );
}

// ============================================================================
// PARTICIPANT AVATARS
// ============================================================================

export function ParticipantAvatars({
  participants,
  currentUserId,
  maxVisible = 5,
  className,
}: ParticipantAvatarsProps) {
  // Filter out current user and inactive participants
  const otherParticipants = participants.filter(
    (p) => p.userId !== currentUserId && p.isActive
  );

  if (otherParticipants.length === 0) {
    return null;
  }

  const visible = otherParticipants.slice(0, maxVisible);
  const overflow = otherParticipants.length - maxVisible;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {visible.map((participant) => (
          <div
            key={participant.id}
            className="relative group"
            title={participant.userName}
          >
            {participant.userAvatar ? (
              <img
                src={participant.userAvatar}
                alt={participant.userName}
                className="w-8 h-8 rounded-full border-2 border-[var(--background)]"
                style={{ borderColor: participant.userColor }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-[var(--background)]"
                style={{ backgroundColor: participant.userColor }}
              >
                {participant.userName.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Online indicator */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--background)]"
              style={{ backgroundColor: participant.userColor }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--card)] border border-[var(--card-border)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {participant.userName}
              {participant.cursorField && (
                <span className="text-foreground-muted ml-1">
                  editing {participant.cursorField}
                </span>
              )}
            </div>
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-8 h-8 rounded-full bg-[var(--background-tertiary)] border-2 border-[var(--background)] flex items-center justify-center text-xs font-medium text-foreground-secondary">
            +{overflow}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CURSOR INDICATOR
// ============================================================================

export function CursorIndicator({
  participant,
  className,
}: {
  participant: CollabParticipant;
  className?: string;
}) {
  if (!participant.cursorField) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white",
        className
      )}
      style={{ backgroundColor: participant.userColor }}
    >
      <User className="w-3 h-3" />
      {participant.userName}
    </div>
  );
}

// ============================================================================
// CURSOR OVERLAY (for text fields)
// ============================================================================

export function CursorOverlay({
  participant,
  field,
  className,
}: CursorOverlayProps) {
  // Only show if this participant is editing this field
  if (participant.cursorField !== field) return null;

  return (
    <div
      className={cn(
        "absolute top-0 pointer-events-none z-10",
        className
      )}
      style={{
        left: participant.cursorOffset ? `${participant.cursorOffset}ch` : undefined,
      }}
    >
      {/* Cursor line */}
      <div
        className="w-0.5 h-5 animate-pulse"
        style={{ backgroundColor: participant.userColor }}
      />
      {/* Name label */}
      <div
        className="absolute left-0 -top-5 px-1 py-0.5 rounded text-[10px] font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: participant.userColor }}
      >
        {participant.userName}
      </div>
    </div>
  );
}

// ============================================================================
// COLLAB STATUS INDICATOR
// ============================================================================

export function CollabStatus({
  isConnected,
  participantCount,
  className,
}: CollabStatusProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1 rounded-lg text-sm",
        isConnected
          ? "bg-green-500/10 text-green-500"
          : "bg-red-500/10 text-red-500",
        className
      )}
    >
      <Circle
        className={cn("w-2 h-2", isConnected ? "fill-green-500" : "fill-red-500")}
      />
      {isConnected ? (
        <>
          <Users className="w-4 h-4" />
          <span>
            {participantCount} {participantCount === 1 ? "editor" : "editors"}
          </span>
        </>
      ) : (
        <span>Disconnected</span>
      )}
    </div>
  );
}

// ============================================================================
// COLLAB FIELD WRAPPER
// ============================================================================

interface CollabFieldProps {
  field: string;
  children: React.ReactNode;
  className?: string;
}

export function CollabField({ field, children, className }: CollabFieldProps) {
  const collab = useCollabOptional();

  if (!collab) {
    return <div className={className}>{children}</div>;
  }

  // Find other participants editing this field
  const editingParticipants = collab.participants.filter(
    (p) =>
      p.userId !== collab.currentUser?.id &&
      p.cursorField === field &&
      p.isActive
  );

  return (
    <div className={cn("relative", className)}>
      {/* Field content */}
      {children}

      {/* Other cursors */}
      {editingParticipants.map((participant) => (
        <CursorOverlay
          key={participant.id}
          participant={participant}
          field={field}
        />
      ))}

      {/* Editing indicator */}
      {editingParticipants.length > 0 && (
        <div className="absolute -top-6 left-0 flex items-center gap-1">
          {editingParticipants.map((p) => (
            <CursorIndicator key={p.id} participant={p} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COLLAB INPUT WRAPPER
// ============================================================================

interface CollabInputProps {
  field: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

export function CollabInput({
  field,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  className,
  multiline = false,
  rows = 3,
}: CollabInputProps) {
  const collab = useCollabOptional();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleFocus = useCallback(() => {
    onFocus?.();
    if (collab && inputRef.current) {
      const pos = inputRef.current.selectionStart || 0;
      collab.updateCursor(field, pos);
    }
  }, [collab, field, onFocus]);

  const handleBlur = useCallback(() => {
    onBlur?.();
    collab?.clearCursor();
  }, [collab, onBlur]);

  const handleSelect = useCallback(() => {
    if (collab && inputRef.current) {
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      collab.updateCursor(field, start, start !== end ? { start, end } : undefined);
    }
  }, [collab, field]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(e.target.value);
      handleSelect();
    },
    [onChange, handleSelect]
  );

  // Find other participants editing this field
  const editingParticipants = collab?.participants.filter(
    (p) =>
      p.userId !== collab.currentUser?.id &&
      p.cursorField === field &&
      p.isActive
  ) || [];

  const inputProps = {
    ref: inputRef as React.Ref<HTMLInputElement>,
    value,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onSelect: handleSelect,
    placeholder,
    className: cn(
      "w-full px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-[var(--primary)] transition-colors",
      editingParticipants.length > 0 && "ring-2 ring-offset-2 ring-offset-[var(--background)]",
      className
    ),
    style: editingParticipants.length > 0 ? {
      ringColor: editingParticipants[0].userColor,
    } : undefined,
  };

  return (
    <CollabField field={field}>
      {multiline ? (
        <textarea
          {...inputProps}
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          rows={rows}
        />
      ) : (
        <input type="text" {...inputProps} />
      )}
    </CollabField>
  );
}

// ============================================================================
// COLLAB PANEL (shows all active editors)
// ============================================================================

interface CollabPanelProps {
  className?: string;
}

export function CollabPanel({ className }: CollabPanelProps) {
  const collab = useCollab();

  const otherParticipants = collab.participants.filter(
    (p) => p.userId !== collab.currentUser?.id && p.isActive
  );

  return (
    <div
      className={cn(
        "p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Collaborators</h4>
        <CollabStatus
          isConnected={collab.isConnected}
          participantCount={collab.participants.length}
        />
      </div>

      {otherParticipants.length === 0 ? (
        <p className="text-sm text-foreground-secondary">
          No other editors at this time
        </p>
      ) : (
        <div className="space-y-2">
          {otherParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-2 bg-[var(--background-tertiary)] rounded-lg"
            >
              {participant.userAvatar ? (
                <img
                  src={participant.userAvatar}
                  alt={participant.userName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                  style={{ backgroundColor: participant.userColor }}
                >
                  {participant.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {participant.userName}
                </p>
                {participant.cursorField && (
                  <p className="text-xs text-foreground-muted truncate">
                    Editing: {participant.cursorField}
                  </p>
                )}
              </div>
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: participant.userColor }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  CollabUser,
  CollaborativeEditorProps,
  ParticipantAvatarsProps,
  CursorOverlayProps,
  CollabStatusProps,
  CollabFieldProps,
  CollabInputProps,
  CollabPanelProps,
};
