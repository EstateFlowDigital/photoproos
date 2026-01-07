import { describe, it, expect } from "vitest";
import {
  success,
  ok,
  fail,
  isSuccess,
  isError,
  unwrap,
  getOrDefault,
  mapResult,
  type ActionResult,
} from "./action-result";

describe("Helper Functions", () => {
  describe("success", () => {
    it("creates a success result with data", () => {
      const result = success({ id: "123", name: "Test" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: "123", name: "Test" });
      }
    });

    it("creates a success result with primitive data", () => {
      const result = success(42);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it("creates a success result with array data", () => {
      const result = success([1, 2, 3]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([1, 2, 3]);
      }
    });
  });

  describe("ok", () => {
    it("creates a void success result", () => {
      const result = ok();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });
  });

  describe("fail", () => {
    it("creates an error result with message", () => {
      const result = fail("Something went wrong");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Something went wrong");
      }
    });

    it("can be typed for any result type", () => {
      const result: ActionResult<{ id: string }> = fail("Not found");
      expect(result.success).toBe(false);
    });
  });
});

describe("Type Guards", () => {
  describe("isSuccess", () => {
    it("returns true for success results", () => {
      const result = success({ id: "123" });
      expect(isSuccess(result)).toBe(true);
    });

    it("returns false for error results", () => {
      const result = fail("Error");
      expect(isSuccess(result)).toBe(false);
    });

    it("narrows the type correctly", () => {
      const result: ActionResult<{ name: string }> = success({ name: "Test" });
      if (isSuccess(result)) {
        // TypeScript should know result.data exists here
        expect(result.data.name).toBe("Test");
      }
    });
  });

  describe("isError", () => {
    it("returns true for error results", () => {
      const result = fail("Error");
      expect(isError(result)).toBe(true);
    });

    it("returns false for success results", () => {
      const result = success({ id: "123" });
      expect(isError(result)).toBe(false);
    });

    it("narrows the type correctly", () => {
      const result: ActionResult<{ name: string }> = fail("Not found");
      if (isError(result)) {
        // TypeScript should know result.error exists here
        expect(result.error).toBe("Not found");
      }
    });
  });
});

describe("Utility Functions", () => {
  describe("unwrap", () => {
    it("returns data for successful results", () => {
      const result = success({ id: "123", name: "Test" });
      const data = unwrap(result);
      expect(data).toEqual({ id: "123", name: "Test" });
    });

    it("throws error for failed results", () => {
      const result = fail("Something went wrong");
      expect(() => unwrap(result)).toThrow("Something went wrong");
    });

    it("works with void results", () => {
      const result = ok();
      expect(unwrap(result)).toBeUndefined();
    });
  });

  describe("getOrDefault", () => {
    it("returns data for successful results", () => {
      const result = success({ count: 5 });
      const data = getOrDefault(result, { count: 0 });
      expect(data).toEqual({ count: 5 });
    });

    it("returns default for failed results", () => {
      const result: ActionResult<{ count: number }> = fail("Error");
      const data = getOrDefault(result, { count: 0 });
      expect(data).toEqual({ count: 0 });
    });

    it("works with array defaults", () => {
      const result: ActionResult<string[]> = fail("Error");
      const data = getOrDefault(result, []);
      expect(data).toEqual([]);
    });

    it("works with primitive defaults", () => {
      const result: ActionResult<number> = fail("Error");
      const data = getOrDefault(result, 0);
      expect(data).toBe(0);
    });
  });

  describe("mapResult", () => {
    it("transforms successful result data", () => {
      const result = success({ id: "123", name: "Test" });
      const mapped = mapResult(result, (data) => data.name);
      expect(mapped).toEqual({ success: true, data: "Test" });
    });

    it("passes through error results unchanged", () => {
      // Use explicit typing for the callback to avoid unknown data type
      const result: ActionResult<{ id: string; name: string }> = fail("Not found");
      const mapped = mapResult(result, (data: { id: string; name: string }) => data.name);
      expect(mapped).toEqual({ success: false, error: "Not found" });
    });

    it("can transform to different types", () => {
      const result = success({ value: 42 });
      const mapped = mapResult(result, (data) => data.value * 2);
      expect(mapped).toEqual({ success: true, data: 84 });
    });

    it("can transform to complex types", () => {
      const result = success({ firstName: "John", lastName: "Doe" });
      const mapped = mapResult(result, (data) => ({
        fullName: `${data.firstName} ${data.lastName}`,
        initials: `${data.firstName[0]}${data.lastName[0]}`,
      }));
      expect(mapped).toEqual({
        success: true,
        data: { fullName: "John Doe", initials: "JD" },
      });
    });
  });
});

describe("Type Safety", () => {
  it("discriminated union works with if statement", () => {
    const result: ActionResult<{ id: string }> = success({ id: "123" });

    if (result.success) {
      // TypeScript knows result.data exists
      expect(result.data.id).toBe("123");
    } else {
      // TypeScript knows result.error exists
      expect(result.error).toBeDefined();
    }
  });

  it("discriminated union works with ternary", () => {
    const successResult: ActionResult<string> = success("hello");

    const successValue = successResult.success
      ? successResult.data
      : "fallback";

    expect(successValue).toBe("hello");
  });

  it("error results return fallback via getOrDefault", () => {
    const errorResult: ActionResult<string> = fail("error");
    // Since fail() always returns success: false, use getOrDefault for fallback
    const errorValue = getOrDefault(errorResult, "fallback");

    expect(errorValue).toBe("fallback");
  });
});
