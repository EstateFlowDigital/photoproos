/**
 * CMS Collaboration Types
 *
 * Type definitions for CMS collaborative editing.
 * These are separated from the main cms-collaboration.ts server actions file
 * because "use server" files require all exports to be async functions.
 */

export type { CollabSession, CollabParticipant, CollabEdit, CursorPosition } from "@/lib/cms/collaboration-engine";
