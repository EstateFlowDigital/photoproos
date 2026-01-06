/**
 * Standardized Error Handling Module
 *
 * Provides consistent error types, handling, and messaging
 * across the application.
 */

// ============================================================================
// ERROR CODES
// ============================================================================

/**
 * Standard error codes for consistent error handling
 */
export const ErrorCode = {
  // Authentication & Authorization
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // External Services
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  INTEGRATION_ERROR: "INTEGRATION_ERROR",
  PAYMENT_ERROR: "PAYMENT_ERROR",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",

  // Business Logic
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

/**
 * Base application error with error code support
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication/Authorization errors
 */
export class AuthError extends AppError {
  constructor(
    message: string = "Authentication required",
    code: ErrorCode = ErrorCode.UNAUTHORIZED
  ) {
    super(message, code, code === ErrorCode.FORBIDDEN ? 403 : 401);
    this.name = "AuthError";
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(
    message: string = "Validation failed",
    fields?: Record<string, string>
  ) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, { fields });
    this.name = "ValidationError";
    this.fields = fields;
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource", id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, ErrorCode.NOT_FOUND, 404, { resource, id });
    this.name = "NotFoundError";
  }
}

/**
 * Conflict errors (e.g., duplicate resources)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, ErrorCode.CONFLICT, 409);
    this.name = "ConflictError";
  }
}

/**
 * Rate limit errors
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = "Rate limit exceeded", retryAfter?: number) {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429, { retryAfter });
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * External service errors
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(service: string, message?: string) {
    super(
      message || `Error communicating with ${service}`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      502,
      { service }
    );
    this.name = "ExternalServiceError";
    this.service = service;
  }
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * User-friendly error messages for common error codes
 */
const userFriendlyMessages: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: "Please sign in to continue",
  [ErrorCode.FORBIDDEN]: "You don't have permission to perform this action",
  [ErrorCode.SESSION_EXPIRED]: "Your session has expired. Please sign in again",
  [ErrorCode.VALIDATION_ERROR]: "Please check your input and try again",
  [ErrorCode.INVALID_INPUT]: "The provided input is invalid",
  [ErrorCode.MISSING_REQUIRED_FIELD]: "Please fill in all required fields",
  [ErrorCode.NOT_FOUND]: "The requested resource was not found",
  [ErrorCode.ALREADY_EXISTS]: "This resource already exists",
  [ErrorCode.CONFLICT]: "This action conflicts with existing data",
  [ErrorCode.RATE_LIMIT_EXCEEDED]: "Too many requests. Please try again later",
  [ErrorCode.TOO_MANY_REQUESTS]: "Too many requests. Please slow down",
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: "An external service is temporarily unavailable",
  [ErrorCode.INTEGRATION_ERROR]: "Integration error. Please try again",
  [ErrorCode.PAYMENT_ERROR]: "Payment processing failed. Please try again",
  [ErrorCode.INTERNAL_ERROR]: "Something went wrong. Please try again",
  [ErrorCode.DATABASE_ERROR]: "A database error occurred. Please try again",
  [ErrorCode.CONFIGURATION_ERROR]: "Configuration error. Please contact support",
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: "You don't have permission to do this",
  [ErrorCode.OPERATION_NOT_ALLOWED]: "This operation is not allowed",
  [ErrorCode.QUOTA_EXCEEDED]: "You've reached your usage limit",
};

/**
 * Get a user-friendly error message for an error code
 */
export function getUserFriendlyMessage(code: ErrorCode): string {
  return userFriendlyMessages[code] || "An unexpected error occurred";
}

/**
 * Normalize any error into an AppError
 */
export function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for common error patterns
    const message = error.message.toLowerCase();

    if (message.includes("unauthorized") || message.includes("unauthenticated")) {
      return new AuthError(error.message);
    }

    if (message.includes("not found")) {
      return new NotFoundError(undefined, undefined);
    }

    if (message.includes("validation") || message.includes("invalid")) {
      return new ValidationError(error.message);
    }

    if (message.includes("unique constraint") || message.includes("duplicate")) {
      return new ConflictError(error.message);
    }

    return new AppError(error.message, ErrorCode.INTERNAL_ERROR);
  }

  // String error
  if (typeof error === "string") {
    return new AppError(error, ErrorCode.INTERNAL_ERROR);
  }

  // Unknown error
  return new AppError("An unexpected error occurred", ErrorCode.INTERNAL_ERROR);
}

/**
 * Extract a safe error message for the client
 * In production, returns generic messages for internal errors
 */
export function getSafeErrorMessage(error: unknown, isProduction = true): string {
  const normalized = normalizeError(error);

  // For operational errors, return the actual message
  if (normalized.isOperational) {
    return normalized.message;
  }

  // For non-operational (programming) errors, return generic message in production
  if (isProduction) {
    return getUserFriendlyMessage(normalized.code);
  }

  // In development, return the actual error
  return normalized.message;
}

/**
 * Log error with context (for server-side use)
 */
export function logError(
  error: unknown,
  context?: {
    action?: string;
    userId?: string;
    organizationId?: string;
    [key: string]: unknown;
  }
): void {
  const normalized = normalizeError(error);

  const logData = {
    code: normalized.code,
    message: normalized.message,
    statusCode: normalized.statusCode,
    isOperational: normalized.isOperational,
    context: { ...normalized.context, ...context },
    stack: normalized.stack,
    timestamp: new Date().toISOString(),
  };

  // In production, you'd want to send this to a logging service
  if (normalized.isOperational) {
    console.warn("[Operational Error]", logData);
  } else {
    console.error("[Programming Error]", logData);
  }
}

// ============================================================================
// ACTION HELPERS
// ============================================================================

import { type ActionResult, fail } from "@/lib/types/action-result";

/**
 * Handle errors in server actions consistently
 *
 * @example
 * export async function createUser(data: UserInput): Promise<ActionResult<User>> {
 *   try {
 *     const user = await prisma.user.create({ data });
 *     return success(user);
 *   } catch (error) {
 *     return handleActionError(error, "createUser");
 *   }
 * }
 */
export function handleActionError<T = void>(
  error: unknown,
  action?: string
): ActionResult<T> {
  logError(error, { action });
  const message = getSafeErrorMessage(error, process.env.NODE_ENV === "production");
  return fail(message);
}

/**
 * Wrap an async function with consistent error handling
 *
 * @example
 * export const createUser = withErrorHandling(
 *   async (data: UserInput): Promise<ActionResult<User>> => {
 *     const user = await prisma.user.create({ data });
 *     return success(user);
 *   },
 *   "createUser"
 * );
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<ActionResult<R>>,
  actionName?: string
): (...args: T) => Promise<ActionResult<R>> {
  return async (...args: T): Promise<ActionResult<R>> => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleActionError(error, actionName);
    }
  };
}
