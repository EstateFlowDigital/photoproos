import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash is configured
const isConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client only if configured
const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Rate limiters for different endpoints
 * Falls back to no-op if Upstash is not configured (dev mode)
 */

// Gallery favorites: 30 requests per minute per IP
export const favoritesRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      analytics: true,
      prefix: "ratelimit:favorites",
    })
  : null;

// Gallery comments: 10 requests per minute per IP
export const commentsRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "ratelimit:comments",
    })
  : null;

// Batch downloads: 5 requests per minute per session
export const batchDownloadRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "ratelimit:batch-download",
    })
  : null;

// Single asset downloads: 30 requests per minute per session
export const singleDownloadRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      analytics: true,
      prefix: "ratelimit:single-download",
    })
  : null;

// Property inquiry: 3 requests per minute per IP
export const propertyInquiryRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "60 s"),
      analytics: true,
      prefix: "ratelimit:property-inquiry",
    })
  : null;

// Magic link requests: 3 requests per hour per email
export const magicLinkRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "3600 s"),
      analytics: true,
      prefix: "ratelimit:magic-link",
    })
  : null;

// Gallery feedback: 10 requests per minute per IP
export const feedbackRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "ratelimit:feedback",
    })
  : null;

/**
 * Helper to check rate limit and return appropriate response
 * Returns null if allowed, or a Response object if rate limited
 */
export async function checkRateLimit(
  ratelimiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; remaining?: number; reset?: number }> {
  // If rate limiting is not configured, allow all requests
  if (!ratelimiter) {
    return { success: true };
  }

  try {
    const result = await ratelimiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // Log error but don't block request if rate limiting fails
    console.error("[RateLimit] Error checking rate limit:", error);
    return { success: true };
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check common headers for real IP behind proxies
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback - this may not be accurate behind proxies
  return "unknown";
}
