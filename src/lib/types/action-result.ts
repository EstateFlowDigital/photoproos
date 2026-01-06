/**
 * Standardized Action Result Types
 *
 * Use discriminated unions for type-safe success/error handling.
 * When `success` is true, `data` is guaranteed to exist.
 * When `success` is false, `error` is guaranteed to exist.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Generic action result with data payload.
 * The discriminated union ensures type safety when checking success.
 *
 * @template T The type of data returned on success
 *
 * @example
 * async function getUser(id: string): Promise<ActionResult<User>> {
 *   try {
 *     const user = await prisma.user.findUnique({ where: { id } });
 *     if (!user) return { success: false, error: "User not found" };
 *     return { success: true, data: user };
 *   } catch (error) {
 *     return { success: false, error: "Failed to fetch user" };
 *   }
 * }
 *
 * // Usage - TypeScript narrows the type based on success
 * const result = await getUser("123");
 * if (result.success) {
 *   console.log(result.data.name); // data is guaranteed to exist
 * } else {
 *   console.error(result.error); // error is guaranteed to exist
 * }
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Action result for operations that don't return data.
 * Alias for ActionResult<void> for cleaner signatures.
 *
 * @example
 * async function deleteItem(id: string): Promise<VoidActionResult> {
 *   try {
 *     await prisma.item.delete({ where: { id } });
 *     return { success: true, data: undefined };
 *   } catch (error) {
 *     return { success: false, error: "Failed to delete item" };
 *   }
 * }
 */
export type VoidActionResult = ActionResult<void>;

// ============================================================================
// COMMON RESULT TYPES
// ============================================================================

/**
 * Action result that returns an ID (common for create operations)
 */
export type IdActionResult = ActionResult<{ id: string }>;

/**
 * Action result that returns a URL
 */
export type UrlActionResult = ActionResult<{ url: string }>;

/**
 * Action result that returns a user-facing message
 */
export type MessageActionResult = ActionResult<{ message: string }>;

/**
 * Action result with count (common for batch operations)
 */
export type CountActionResult = ActionResult<{ count: number }>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a success result with data
 *
 * @example
 * return success({ user });
 * return success({ id: "123" });
 */
export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Create a void success result (for operations with no return data)
 *
 * @example
 * await prisma.item.delete({ where: { id } });
 * return ok();
 */
export function ok(): VoidActionResult {
  return { success: true, data: undefined };
}

/**
 * Create an error result
 *
 * @example
 * return fail("User not found");
 * return fail("Failed to create project");
 */
export function fail<T = void>(error: string): ActionResult<T> {
  return { success: false, error };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a result is successful
 *
 * @example
 * const result = await getUser("123");
 * if (isSuccess(result)) {
 *   console.log(result.data.name);
 * }
 */
export function isSuccess<T>(
  result: ActionResult<T>
): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if a result is an error
 *
 * @example
 * const result = await getUser("123");
 * if (isError(result)) {
 *   console.error(result.error);
 * }
 */
export function isError<T>(
  result: ActionResult<T>
): result is { success: false; error: string } {
  return result.success === false;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Unwrap a result, throwing an error if unsuccessful.
 * Use sparingly - prefer pattern matching with isSuccess/isError.
 *
 * @example
 * const user = unwrap(await getUser("123")); // throws if error
 */
export function unwrap<T>(result: ActionResult<T>): T {
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error);
}

/**
 * Get data from a result with a fallback value
 *
 * @example
 * const users = getOrDefault(await getUsers(), []);
 */
export function getOrDefault<T>(result: ActionResult<T>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}

/**
 * Map the data of a successful result
 *
 * @example
 * const result = await getUser("123");
 * const nameResult = mapResult(result, user => user.name);
 */
export function mapResult<T, U>(
  result: ActionResult<T>,
  fn: (data: T) => U
): ActionResult<U> {
  if (result.success) {
    return { success: true, data: fn(result.data) };
  }
  return result;
}

// ============================================================================
// BACKWARDS COMPATIBILITY (DEPRECATED)
// ============================================================================

/**
 * @deprecated Use ActionResult<T> instead. Will be removed in future version.
 */
export type ActionResultWithData<T> = ActionResult<T>;

/**
 * @deprecated Use IdActionResult instead. Will be removed in future version.
 */
export type ActionResultWithId = IdActionResult;

/**
 * @deprecated Use UrlActionResult instead. Will be removed in future version.
 */
export type ActionResultWithUrl = UrlActionResult;

/**
 * @deprecated Use MessageActionResult instead. Will be removed in future version.
 */
export type ActionResultWithMessage = MessageActionResult;

/**
 * @deprecated Use success() or ok() instead. Will be removed in future version.
 */
export function successResult(): VoidActionResult;
export function successResult<T>(data: T): ActionResult<T>;
export function successResult<T>(data?: T): ActionResult<T> | VoidActionResult {
  if (data === undefined) {
    return ok();
  }
  return success(data);
}

/**
 * @deprecated Use fail() instead. Will be removed in future version.
 */
export function errorResult(error: string): VoidActionResult {
  return fail(error);
}
