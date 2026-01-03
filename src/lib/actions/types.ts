// ============================================================================
// SHARED ACTION TYPES
// ============================================================================

/**
 * Standard result type for server actions
 * @template T The type of data returned on success (defaults to void)
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
