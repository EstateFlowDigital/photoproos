/**
 * Shared Action Result Types
 *
 * Standard return types for server actions to ensure consistent
 * error handling and success/failure responses across the application.
 */

/**
 * Base action result type with success/error state.
 * Use this for actions that only return success/failure without additional data.
 *
 * @example
 * export async function deleteItem(id: string): Promise<ActionResult> {
 *   try {
 *     await prisma.item.delete({ where: { id } });
 *     return { success: true };
 *   } catch (error) {
 *     return { success: false, error: "Failed to delete item" };
 *   }
 * }
 */
export type ActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Generic action result with data payload.
 * Use this for actions that return data on success.
 *
 * @example
 * export async function getUser(id: string): Promise<ActionResultWithData<User>> {
 *   try {
 *     const user = await prisma.user.findUnique({ where: { id } });
 *     if (!user) return { success: false, error: "User not found" };
 *     return { success: true, data: user };
 *   } catch (error) {
 *     return { success: false, error: "Failed to fetch user" };
 *   }
 * }
 */
export type ActionResultWithData<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Action result with a single ID.
 * Common for create operations that return the new entity's ID.
 *
 * @example
 * export async function createProject(name: string): Promise<ActionResultWithId> {
 *   try {
 *     const project = await prisma.project.create({ data: { name } });
 *     return { success: true, id: project.id };
 *   } catch (error) {
 *     return { success: false, error: "Failed to create project" };
 *   }
 * }
 */
export type ActionResultWithId = {
  success: boolean;
  id?: string;
  error?: string;
};

/**
 * Action result with a URL.
 * Common for operations that generate URLs (redirects, uploads, etc.).
 *
 * @example
 * export async function generateUploadUrl(): Promise<ActionResultWithUrl> {
 *   try {
 *     const url = await getSignedUploadUrl();
 *     return { success: true, url };
 *   } catch (error) {
 *     return { success: false, error: "Failed to generate URL" };
 *   }
 * }
 */
export type ActionResultWithUrl = {
  success: boolean;
  url?: string;
  error?: string;
};

/**
 * Action result with message.
 * Use when you need to return a user-facing message on success.
 *
 * @example
 * export async function sendNotification(): Promise<ActionResultWithMessage> {
 *   try {
 *     await sendEmail(...);
 *     return { success: true, message: "Notification sent successfully" };
 *   } catch (error) {
 *     return { success: false, error: "Failed to send notification" };
 *   }
 * }
 */
export type ActionResultWithMessage = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Helper to create a success result
 */
export function successResult(): ActionResult;
export function successResult<T>(data: T): ActionResultWithData<T>;
export function successResult<T>(data?: T): ActionResult | ActionResultWithData<T> {
  if (data === undefined) {
    return { success: true };
  }
  return { success: true, data };
}

/**
 * Helper to create an error result
 */
export function errorResult(error: string): ActionResult {
  return { success: false, error };
}
