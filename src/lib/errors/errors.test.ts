import { describe, it, expect, vi } from "vitest";
import {
  ErrorCode,
  AppError,
  AuthError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  getUserFriendlyMessage,
  normalizeError,
  getSafeErrorMessage,
  handleActionError,
  withErrorHandling,
} from "./index";
import { success } from "@/lib/types/action-result";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("creates error with default values", () => {
      const error = new AppError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it("creates error with custom values", () => {
      const error = new AppError(
        "Custom error",
        ErrorCode.VALIDATION_ERROR,
        400,
        { field: "email" }
      );
      expect(error.message).toBe("Custom error");
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ field: "email" });
    });
  });

  describe("AuthError", () => {
    it("creates unauthorized error by default", () => {
      const error = new AuthError();
      expect(error.message).toBe("Authentication required");
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.statusCode).toBe(401);
    });

    it("creates forbidden error", () => {
      const error = new AuthError("Access denied", ErrorCode.FORBIDDEN);
      expect(error.message).toBe("Access denied");
      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.statusCode).toBe(403);
    });
  });

  describe("ValidationError", () => {
    it("creates validation error", () => {
      const error = new ValidationError("Invalid input", {
        email: "Invalid email format",
        password: "Password too short",
      });
      expect(error.message).toBe("Invalid input");
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.fields).toEqual({
        email: "Invalid email format",
        password: "Password too short",
      });
    });
  });

  describe("NotFoundError", () => {
    it("creates not found error with resource name", () => {
      const error = new NotFoundError("User");
      expect(error.message).toBe("User not found");
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.statusCode).toBe(404);
    });

    it("creates not found error with resource name and ID", () => {
      const error = new NotFoundError("User", "123");
      expect(error.message).toBe("User with ID 123 not found");
    });
  });

  describe("ConflictError", () => {
    it("creates conflict error", () => {
      const error = new ConflictError("Email already registered");
      expect(error.message).toBe("Email already registered");
      expect(error.code).toBe(ErrorCode.CONFLICT);
      expect(error.statusCode).toBe(409);
    });
  });

  describe("RateLimitError", () => {
    it("creates rate limit error", () => {
      const error = new RateLimitError("Too many requests", 60);
      expect(error.message).toBe("Too many requests");
      expect(error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
    });
  });

  describe("ExternalServiceError", () => {
    it("creates external service error", () => {
      const error = new ExternalServiceError("Stripe", "Payment declined");
      expect(error.message).toBe("Payment declined");
      expect(error.code).toBe(ErrorCode.EXTERNAL_SERVICE_ERROR);
      expect(error.statusCode).toBe(502);
      expect(error.service).toBe("Stripe");
    });

    it("creates error with default message", () => {
      const error = new ExternalServiceError("SendGrid");
      expect(error.message).toBe("Error communicating with SendGrid");
    });
  });
});

describe("Error Utilities", () => {
  describe("getUserFriendlyMessage", () => {
    it("returns friendly message for known error codes", () => {
      expect(getUserFriendlyMessage(ErrorCode.UNAUTHORIZED)).toBe(
        "Please sign in to continue"
      );
      expect(getUserFriendlyMessage(ErrorCode.NOT_FOUND)).toBe(
        "The requested resource was not found"
      );
      expect(getUserFriendlyMessage(ErrorCode.RATE_LIMIT_EXCEEDED)).toBe(
        "Too many requests. Please try again later"
      );
    });
  });

  describe("normalizeError", () => {
    it("returns AppError unchanged", () => {
      const original = new AppError("Test", ErrorCode.VALIDATION_ERROR, 400);
      const normalized = normalizeError(original);
      expect(normalized).toBe(original);
    });

    it("converts standard Error to AppError", () => {
      const original = new Error("Something failed");
      const normalized = normalizeError(original);
      expect(normalized).toBeInstanceOf(AppError);
      expect(normalized.message).toBe("Something failed");
      expect(normalized.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it("detects unauthorized errors", () => {
      const original = new Error("Unauthorized access");
      const normalized = normalizeError(original);
      expect(normalized).toBeInstanceOf(AuthError);
    });

    it("detects not found errors", () => {
      const original = new Error("User not found");
      const normalized = normalizeError(original);
      expect(normalized).toBeInstanceOf(NotFoundError);
    });

    it("detects validation errors", () => {
      const original = new Error("Invalid email format");
      const normalized = normalizeError(original);
      expect(normalized).toBeInstanceOf(ValidationError);
    });

    it("detects duplicate/conflict errors", () => {
      const original = new Error("Unique constraint violation");
      const normalized = normalizeError(original);
      expect(normalized).toBeInstanceOf(ConflictError);
    });

    it("converts string to AppError", () => {
      const normalized = normalizeError("Error string");
      expect(normalized).toBeInstanceOf(AppError);
      expect(normalized.message).toBe("Error string");
    });

    it("handles unknown error types", () => {
      const normalized = normalizeError({ custom: "error" });
      expect(normalized).toBeInstanceOf(AppError);
      expect(normalized.message).toBe("An unexpected error occurred");
    });
  });

  describe("getSafeErrorMessage", () => {
    it("returns actual message for operational errors", () => {
      const error = new ValidationError("Email is required");
      expect(getSafeErrorMessage(error, true)).toBe("Email is required");
    });

    it("returns actual message for normalized operational errors", () => {
      // When we normalize an error, it becomes operational
      // so it returns the actual message
      const error = new Error("Database connection failed");
      expect(getSafeErrorMessage(error, true)).toBe(
        "Database connection failed"
      );
    });

    it("returns actual message in development", () => {
      const error = new Error("Database connection failed");
      expect(getSafeErrorMessage(error, false)).toBe(
        "Database connection failed"
      );
    });
  });
});

describe("Action Helpers", () => {
  describe("handleActionError", () => {
    it("returns fail result with error message", () => {
      // Suppress console output for this test
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = handleActionError(new Error("Test error"));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Test error");
      }

      consoleSpy.mockRestore();
    });
  });

  describe("withErrorHandling", () => {
    it("returns success result when no error", async () => {
      const fn = async () => success({ id: "123" });
      const wrapped = withErrorHandling(fn, "testAction");

      const result = await wrapped();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: "123" });
      }
    });

    it("catches errors and returns fail result", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const fn = async () => {
        throw new Error("Async error");
      };
      const wrapped = withErrorHandling(fn, "testAction");

      const result = await wrapped();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Async error");
      }

      consoleSpy.mockRestore();
    });
  });
});
