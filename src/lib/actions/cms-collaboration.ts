"use server";

import { isSuperAdmin } from "@/lib/auth/super-admin";
import { ok, fail, type ActionResult } from "@/lib/types/action-result";
import {
  getOrCreateSession,
  getActiveParticipants,
  joinSession,
  leaveSession,
  updateCursor,
  pingSession,
  updateDocumentState,
  getDocumentState,
  recordEdit,
  getEditsSinceVersion,
  getCurrentVersion,
  cleanupInactiveSessions,
  cleanupOldEdits,
  type CollabSession,
  type CollabParticipant,
  type CollabEdit,
  type CursorPosition,
} from "@/lib/cms/collaboration";
import type { CollabEditOperation } from "@prisma/client";

// ============================================================================
// SESSION ACTIONS
// ============================================================================

/**
 * Start or join a collaborative editing session
 */
export async function startCollabSession(
  entityType: string,
  entityId: string,
  user: { id: string; name: string; avatar?: string }
): Promise<
  ActionResult<{
    session: CollabSession;
    participant: CollabParticipant;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const result = await joinSession(entityType, entityId, user);
    return ok(result);
  } catch (error) {
    console.error("Error starting collab session:", error);
    return fail("Failed to start collaborative session");
  }
}

/**
 * Leave a collaborative editing session
 */
export async function endCollabSession(
  sessionId: string,
  userId: string
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await leaveSession(sessionId, userId);
    return ok(undefined);
  } catch (error) {
    console.error("Error ending collab session:", error);
    return fail("Failed to end session");
  }
}

/**
 * Get session info with active participants
 */
export async function getCollabSession(
  entityType: string,
  entityId: string
): Promise<ActionResult<CollabSession>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const session = await getOrCreateSession(entityType, entityId);
    return ok(session);
  } catch (error) {
    console.error("Error getting collab session:", error);
    return fail("Failed to get session");
  }
}

// ============================================================================
// PRESENCE ACTIONS
// ============================================================================

/**
 * Send heartbeat and get active participants
 */
export async function collabPing(
  sessionId: string,
  userId: string
): Promise<ActionResult<CollabParticipant[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const participants = await pingSession(sessionId, userId);
    return ok(participants);
  } catch (error) {
    console.error("Error pinging session:", error);
    return fail("Failed to ping session");
  }
}

/**
 * Update cursor position
 */
export async function updateCollabCursor(
  sessionId: string,
  userId: string,
  cursor: CursorPosition | null
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await updateCursor(sessionId, userId, cursor);
    return ok(undefined);
  } catch (error) {
    console.error("Error updating cursor:", error);
    return fail("Failed to update cursor");
  }
}

/**
 * Get active participants
 */
export async function getCollabParticipants(
  sessionId: string
): Promise<ActionResult<CollabParticipant[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const participants = await getActiveParticipants(sessionId);
    return ok(participants);
  } catch (error) {
    console.error("Error getting participants:", error);
    return fail("Failed to get participants");
  }
}

// ============================================================================
// DOCUMENT STATE ACTIONS
// ============================================================================

/**
 * Save document state
 */
export async function saveCollabDocumentState(
  sessionId: string,
  documentState: unknown
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await updateDocumentState(sessionId, documentState);
    return ok(undefined);
  } catch (error) {
    console.error("Error saving document state:", error);
    return fail("Failed to save document state");
  }
}

/**
 * Get document state
 */
export async function getCollabDocumentState(
  sessionId: string
): Promise<ActionResult<unknown | null>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const state = await getDocumentState(sessionId);
    return ok(state);
  } catch (error) {
    console.error("Error getting document state:", error);
    return fail("Failed to get document state");
  }
}

// ============================================================================
// EDIT TRACKING ACTIONS
// ============================================================================

/**
 * Record an edit
 */
export async function recordCollabEdit(
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
): Promise<ActionResult<CollabEdit>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const recorded = await recordEdit(sessionId, user, edit);
    return ok(recorded);
  } catch (error) {
    console.error("Error recording edit:", error);
    return fail("Failed to record edit");
  }
}

/**
 * Get edits since a version
 */
export async function getCollabEditsSince(
  sessionId: string,
  sinceVersion: number
): Promise<ActionResult<CollabEdit[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const edits = await getEditsSinceVersion(sessionId, sinceVersion);
    return ok(edits);
  } catch (error) {
    console.error("Error getting edits:", error);
    return fail("Failed to get edits");
  }
}

/**
 * Get current version
 */
export async function getCollabVersion(
  sessionId: string
): Promise<ActionResult<number>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const version = await getCurrentVersion(sessionId);
    return ok(version);
  } catch (error) {
    console.error("Error getting version:", error);
    return fail("Failed to get version");
  }
}

// ============================================================================
// SYNC ACTIONS (for polling-based real-time updates)
// ============================================================================

/**
 * Sync all collab data in one request (for efficient polling)
 */
export async function syncCollabSession(
  sessionId: string,
  userId: string,
  sinceVersion: number,
  cursor: CursorPosition | null
): Promise<
  ActionResult<{
    participants: CollabParticipant[];
    edits: CollabEdit[];
    currentVersion: number;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Update cursor and ping in parallel
    const [participants, edits, currentVersion] = await Promise.all([
      (async () => {
        await updateCursor(sessionId, userId, cursor);
        return pingSession(sessionId, userId);
      })(),
      getEditsSinceVersion(sessionId, sinceVersion),
      getCurrentVersion(sessionId),
    ]);

    return ok({
      participants,
      edits,
      currentVersion,
    });
  } catch (error) {
    console.error("Error syncing session:", error);
    return fail("Failed to sync session");
  }
}

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

/**
 * Clean up inactive sessions
 */
export async function cleanupCollabSessions(): Promise<
  ActionResult<{ sessions: number; edits: number }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const [sessions, edits] = await Promise.all([
      cleanupInactiveSessions(7),
      cleanupOldEdits(1000),
    ]);

    return ok({
      sessions: sessions.deleted,
      edits: edits.deleted,
    });
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
    return fail("Failed to clean up sessions");
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Note: Type exports (CollabSession, CollabParticipant, CollabEdit, CursorPosition)
// are available from "@/lib/actions/cms-collaboration-types" - this is separated because
// "use server" files can only export async functions.
