"use server";

import { db } from "@/lib/db";
import type { CollabEditOperation } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface CollabParticipant {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userColor: string;
  cursorField: string | null;
  cursorOffset: number | null;
  selectionStart: number | null;
  selectionEnd: number | null;
  isActive: boolean;
  lastPing: Date;
}

export interface CollabSession {
  id: string;
  entityType: string;
  entityId: string;
  documentState: unknown;
  participants: CollabParticipant[];
  lastActivity: Date;
}

export interface CollabEdit {
  id: string;
  userId: string;
  userName: string;
  field: string;
  operation: CollabEditOperation;
  position: number | null;
  content: string | null;
  length: number | null;
  previousValue: string | null;
  timestamp: Date;
  version: number;
}

export interface CursorPosition {
  field: string;
  offset: number;
  selectionStart?: number;
  selectionEnd?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Participants are considered inactive after 30 seconds without a ping
export const PARTICIPANT_TIMEOUT_MS = 30 * 1000;

// Cursor colors for participants
const CURSOR_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f97316", // orange
  "#8b5cf6", // purple
  "#ef4444", // red
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#ec4899", // pink
  "#6366f1", // indigo
  "#84cc16", // lime
];

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get or create a collaborative session for an entity
 */
export async function getOrCreateSession(
  entityType: string,
  entityId: string
): Promise<CollabSession> {
  let session = await db.cMSCollabSession.findUnique({
    where: {
      entityType_entityId: { entityType, entityId },
    },
    include: {
      participants: {
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!session) {
    session = await db.cMSCollabSession.create({
      data: {
        entityType,
        entityId,
      },
      include: {
        participants: true,
      },
    });
  }

  return {
    id: session.id,
    entityType: session.entityType,
    entityId: session.entityId,
    documentState: session.documentState,
    lastActivity: session.lastActivity,
    participants: session.participants.map(mapParticipant),
  };
}

/**
 * Get active participants in a session
 */
export async function getActiveParticipants(
  sessionId: string
): Promise<CollabParticipant[]> {
  const cutoff = new Date(Date.now() - PARTICIPANT_TIMEOUT_MS);

  const participants = await db.cMSCollabParticipant.findMany({
    where: {
      sessionId,
      lastPing: { gte: cutoff },
      isActive: true,
    },
    orderBy: { joinedAt: "asc" },
  });

  return participants.map(mapParticipant);
}

/**
 * Clean up stale participants from a session
 */
export async function cleanupStaleParticipants(
  sessionId: string
): Promise<number> {
  const cutoff = new Date(Date.now() - PARTICIPANT_TIMEOUT_MS);

  const result = await db.cMSCollabParticipant.updateMany({
    where: {
      sessionId,
      lastPing: { lt: cutoff },
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  return result.count;
}

// ============================================================================
// PARTICIPANT MANAGEMENT
// ============================================================================

/**
 * Join a collaborative session
 */
export async function joinSession(
  entityType: string,
  entityId: string,
  user: { id: string; name: string; avatar?: string }
): Promise<{ session: CollabSession; participant: CollabParticipant }> {
  // Get or create session
  const session = await getOrCreateSession(entityType, entityId);

  // Check if user already has a participant record
  let participant = await db.cMSCollabParticipant.findUnique({
    where: {
      sessionId_userId: { sessionId: session.id, userId: user.id },
    },
  });

  if (participant) {
    // Update existing participant
    participant = await db.cMSCollabParticipant.update({
      where: { id: participant.id },
      data: {
        isActive: true,
        lastPing: new Date(),
        userName: user.name,
        userAvatar: user.avatar || null,
      },
    });
  } else {
    // Assign color based on number of participants
    const activeCount = session.participants.filter((p) => p.isActive).length;
    const color = CURSOR_COLORS[activeCount % CURSOR_COLORS.length];

    participant = await db.cMSCollabParticipant.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || null,
        userColor: color,
        isActive: true,
      },
    });
  }

  // Update session activity
  await db.cMSCollabSession.update({
    where: { id: session.id },
    data: { lastActivity: new Date() },
  });

  // Clean up stale participants
  await cleanupStaleParticipants(session.id);

  // Get updated session
  const updatedSession = await getOrCreateSession(entityType, entityId);

  return {
    session: updatedSession,
    participant: mapParticipant(participant),
  };
}

/**
 * Leave a collaborative session
 */
export async function leaveSession(
  sessionId: string,
  userId: string
): Promise<void> {
  await db.cMSCollabParticipant.updateMany({
    where: {
      sessionId,
      userId,
    },
    data: {
      isActive: false,
    },
  });
}

/**
 * Update participant's cursor position
 */
export async function updateCursor(
  sessionId: string,
  userId: string,
  cursor: CursorPosition | null
): Promise<void> {
  await db.cMSCollabParticipant.updateMany({
    where: {
      sessionId,
      userId,
    },
    data: {
      cursorField: cursor?.field || null,
      cursorOffset: cursor?.offset ?? null,
      selectionStart: cursor?.selectionStart ?? null,
      selectionEnd: cursor?.selectionEnd ?? null,
      lastPing: new Date(),
    },
  });
}

/**
 * Send a ping to keep participant active
 */
export async function pingSession(
  sessionId: string,
  userId: string
): Promise<CollabParticipant[]> {
  // Update last ping
  await db.cMSCollabParticipant.updateMany({
    where: {
      sessionId,
      userId,
    },
    data: {
      lastPing: new Date(),
    },
  });

  // Clean up stale participants
  await cleanupStaleParticipants(sessionId);

  // Return active participants
  return getActiveParticipants(sessionId);
}

// ============================================================================
// DOCUMENT STATE
// ============================================================================

/**
 * Update document state
 */
export async function updateDocumentState(
  sessionId: string,
  documentState: unknown
): Promise<void> {
  await db.cMSCollabSession.update({
    where: { id: sessionId },
    data: {
      documentState: documentState as object,
      lastActivity: new Date(),
    },
  });
}

/**
 * Get document state
 */
export async function getDocumentState(
  sessionId: string
): Promise<unknown | null> {
  const session = await db.cMSCollabSession.findUnique({
    where: { id: sessionId },
    select: { documentState: true },
  });

  return session?.documentState || null;
}

// ============================================================================
// EDIT TRACKING
// ============================================================================

/**
 * Record an edit for undo/redo support
 */
export async function recordEdit(
  sessionId: string,
  user: { id: string; name: string },
  edit: {
    field: string;
    operation: CollabEditOperation;
    position?: number;
    content?: string;
    length?: number;
    previousValue?: string;
  }
): Promise<CollabEdit> {
  // Get current version
  const lastEdit = await db.cMSCollabEdit.findFirst({
    where: { sessionId },
    orderBy: { version: "desc" },
  });

  const version = (lastEdit?.version || 0) + 1;

  const newEdit = await db.cMSCollabEdit.create({
    data: {
      sessionId,
      userId: user.id,
      userName: user.name,
      field: edit.field,
      operation: edit.operation,
      position: edit.position ?? null,
      content: edit.content ?? null,
      length: edit.length ?? null,
      previousValue: edit.previousValue ?? null,
      version,
    },
  });

  return {
    id: newEdit.id,
    userId: newEdit.userId,
    userName: newEdit.userName,
    field: newEdit.field,
    operation: newEdit.operation,
    position: newEdit.position,
    content: newEdit.content,
    length: newEdit.length,
    previousValue: newEdit.previousValue,
    timestamp: newEdit.timestamp,
    version: newEdit.version,
  };
}

/**
 * Get recent edits since a version
 */
export async function getEditsSinceVersion(
  sessionId: string,
  sinceVersion: number
): Promise<CollabEdit[]> {
  const edits = await db.cMSCollabEdit.findMany({
    where: {
      sessionId,
      version: { gt: sinceVersion },
    },
    orderBy: { version: "asc" },
    take: 100, // Limit to prevent huge responses
  });

  return edits.map((e) => ({
    id: e.id,
    userId: e.userId,
    userName: e.userName,
    field: e.field,
    operation: e.operation,
    position: e.position,
    content: e.content,
    length: e.length,
    previousValue: e.previousValue,
    timestamp: e.timestamp,
    version: e.version,
  }));
}

/**
 * Get current version number
 */
export async function getCurrentVersion(sessionId: string): Promise<number> {
  const lastEdit = await db.cMSCollabEdit.findFirst({
    where: { sessionId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  return lastEdit?.version || 0;
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Clean up inactive sessions
 */
export async function cleanupInactiveSessions(
  maxInactiveDays: number = 7
): Promise<{ deleted: number }> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxInactiveDays);

  const result = await db.cMSCollabSession.deleteMany({
    where: {
      lastActivity: { lt: cutoff },
    },
  });

  return { deleted: result.count };
}

/**
 * Clean up old edits (keep only recent history)
 */
export async function cleanupOldEdits(
  maxEdits: number = 1000
): Promise<{ deleted: number }> {
  // Get sessions with too many edits
  const sessions = await db.cMSCollabSession.findMany({
    include: {
      _count: {
        select: { editHistory: true },
      },
    },
  });

  let totalDeleted = 0;

  for (const session of sessions) {
    if (session._count.editHistory > maxEdits) {
      // Keep only the most recent maxEdits
      const toKeep = await db.cMSCollabEdit.findMany({
        where: { sessionId: session.id },
        orderBy: { version: "desc" },
        take: maxEdits,
        select: { id: true },
      });

      const keepIds = toKeep.map((e) => e.id);

      const result = await db.cMSCollabEdit.deleteMany({
        where: {
          sessionId: session.id,
          id: { notIn: keepIds },
        },
      });

      totalDeleted += result.count;
    }
  }

  return { deleted: totalDeleted };
}

// ============================================================================
// HELPERS
// ============================================================================

function mapParticipant(p: {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userColor: string;
  cursorField: string | null;
  cursorOffset: number | null;
  selectionStart: number | null;
  selectionEnd: number | null;
  isActive: boolean;
  lastPing: Date;
}): CollabParticipant {
  return {
    id: p.id,
    userId: p.userId,
    userName: p.userName,
    userAvatar: p.userAvatar,
    userColor: p.userColor,
    cursorField: p.cursorField,
    cursorOffset: p.cursorOffset,
    selectionStart: p.selectionStart,
    selectionEnd: p.selectionEnd,
    isActive: p.isActive,
    lastPing: p.lastPing,
  };
}
