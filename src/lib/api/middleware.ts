/**
 * API Authentication Middleware
 *
 * Provides utilities for authenticating and authorizing API requests
 * using API keys with scope-based permissions.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// ============================================================================
// Types
// ============================================================================

export type ApiScope = "read" | "write" | "admin";

export interface ApiContext {
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  scopes: string[];
  apiKeyId: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    status: number;
  };
}

// ============================================================================
// Error Responses
// ============================================================================

export const API_ERRORS = {
  UNAUTHORIZED: {
    code: "unauthorized",
    message: "Missing or invalid API key. Include 'Authorization: Bearer sk_live_xxx' header.",
    status: 401,
  },
  INVALID_KEY: {
    code: "invalid_api_key",
    message: "The provided API key is invalid or has been revoked.",
    status: 401,
  },
  EXPIRED_KEY: {
    code: "expired_api_key",
    message: "The provided API key has expired.",
    status: 401,
  },
  FORBIDDEN: {
    code: "forbidden",
    message: "Your API key does not have permission to access this resource.",
    status: 403,
  },
  RATE_LIMITED: {
    code: "rate_limited",
    message: "Too many requests. Please slow down.",
    status: 429,
  },
  NOT_FOUND: {
    code: "not_found",
    message: "The requested resource was not found.",
    status: 404,
  },
  BAD_REQUEST: {
    code: "bad_request",
    message: "Invalid request parameters.",
    status: 400,
  },
  INTERNAL_ERROR: {
    code: "internal_error",
    message: "An unexpected error occurred.",
    status: 500,
  },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Hash an API key for comparison
 */
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Extract API key from request headers
 */
export function extractApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  // Support "Bearer sk_live_xxx" format
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Also support just the key directly
  if (authHeader.startsWith("sk_live_")) {
    return authHeader;
  }

  return null;
}

/**
 * Create an API error response
 */
export function apiError(
  error: (typeof API_ERRORS)[keyof typeof API_ERRORS],
  details?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: details || error.message,
        status: error.status,
      },
    },
    { status: error.status }
  );
}

/**
 * Create a successful API response
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

// ============================================================================
// Authentication
// ============================================================================

/**
 * Authenticate an API request and return the context
 */
export async function authenticateApiRequest(
  request: NextRequest
): Promise<{ success: true; context: ApiContext } | { success: false; error: NextResponse<ApiErrorResponse> }> {
  const apiKeyValue = extractApiKey(request);

  if (!apiKeyValue) {
    return { success: false, error: apiError(API_ERRORS.UNAUTHORIZED) };
  }

  try {
    const keyHash = hashApiKey(apiKeyValue);

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        keyHash,
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!apiKey) {
      return { success: false, error: apiError(API_ERRORS.INVALID_KEY) };
    }

    // Check if expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { success: false, error: apiError(API_ERRORS.EXPIRED_KEY) };
    }

    // Update last used timestamp (fire and forget)
    prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {
        // Ignore errors updating last used
      });

    return {
      success: true,
      context: {
        organizationId: apiKey.organizationId,
        organization: apiKey.organization,
        scopes: apiKey.scopes as string[],
        apiKeyId: apiKey.id,
      },
    };
  } catch (error) {
    console.error("API authentication error:", error);
    return { success: false, error: apiError(API_ERRORS.INTERNAL_ERROR) };
  }
}

/**
 * Check if the API context has the required scope
 */
export function hasScope(context: ApiContext, requiredScope: ApiScope): boolean {
  // Admin scope has access to everything
  if (context.scopes.includes("admin")) {
    return true;
  }

  // Write scope includes read
  if (requiredScope === "read" && context.scopes.includes("write")) {
    return true;
  }

  return context.scopes.includes(requiredScope);
}

/**
 * Require a specific scope, returning an error response if not authorized
 */
export function requireScope(
  context: ApiContext,
  requiredScope: ApiScope
): NextResponse<ApiErrorResponse> | null {
  if (!hasScope(context, requiredScope)) {
    return apiError(
      API_ERRORS.FORBIDDEN,
      `This action requires the '${requiredScope}' scope. Your key has: ${context.scopes.join(", ")}`
    );
  }
  return null;
}

// ============================================================================
// Route Handler Wrapper
// ============================================================================

type ApiHandler<T = unknown> = (
  request: NextRequest,
  context: ApiContext
) => Promise<NextResponse<T | ApiErrorResponse>>;

/**
 * Wrap an API route handler with authentication
 */
export function withApiAuth<T>(
  handler: ApiHandler<T>,
  options?: {
    requiredScope?: ApiScope;
  }
): (request: NextRequest) => Promise<NextResponse<T | ApiErrorResponse>> {
  return async (request: NextRequest) => {
    const authResult = await authenticateApiRequest(request);

    if (!authResult.success) {
      return authResult.error;
    }

    // Check required scope if specified
    if (options?.requiredScope) {
      const scopeError = requireScope(authResult.context, options.requiredScope);
      if (scopeError) {
        return scopeError;
      }
    }

    try {
      return await handler(request, authResult.context);
    } catch (error) {
      console.error("API handler error:", error);
      return apiError(API_ERRORS.INTERNAL_ERROR);
    }
  };
}

// ============================================================================
// Pagination Helpers
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Parse pagination parameters from request URL
 */
export function parsePagination(request: NextRequest): PaginationParams {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);

  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasMore: params.page < totalPages,
    },
  };
}
