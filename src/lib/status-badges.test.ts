import { describe, it, expect } from "vitest";
import {
  getStatusTone,
  getStatusBadgeClasses,
  formatStatusLabel,
  type StatusTone,
} from "./status-badges";

describe("getStatusTone", () => {
  describe("success tones", () => {
    it.each([
      "active",
      "approved",
      "completed",
      "confirmed",
      "converted",
      "delivered",
      "paid",
      "signed",
    ])("returns 'success' for '%s' status", (status) => {
      expect(getStatusTone(status)).toBe("success");
    });
  });

  describe("danger tones", () => {
    it.each(["cancelled", "expired", "failed", "overdue", "rejected"])(
      "returns 'danger' for '%s' status",
      (status) => {
        expect(getStatusTone(status)).toBe("danger");
      }
    );
  });

  describe("warning tones", () => {
    it("returns 'warning' for 'pending' status", () => {
      expect(getStatusTone("pending")).toBe("warning");
    });
  });

  describe("info tones", () => {
    it.each(["queued", "sent"])("returns 'info' for '%s' status", (status) => {
      expect(getStatusTone(status)).toBe("info");
    });
  });

  describe("neutral tones", () => {
    it.each(["draft", "inactive"])(
      "returns 'neutral' for '%s' status",
      (status) => {
        expect(getStatusTone(status)).toBe("neutral");
      }
    );
  });

  describe("unknown statuses", () => {
    it("returns 'neutral' for unknown status", () => {
      expect(getStatusTone("unknown_status")).toBe("neutral");
    });

    it("returns 'neutral' for empty string", () => {
      expect(getStatusTone("")).toBe("neutral");
    });
  });
});

describe("getStatusBadgeClasses", () => {
  describe("returns correct classes for each tone", () => {
    it("returns neutral classes for draft status", () => {
      const classes = getStatusBadgeClasses("draft");
      expect(classes).toContain("bg-[var(--background-secondary)]");
      expect(classes).toContain("text-foreground-muted");
    });

    it("returns info classes for sent status", () => {
      const classes = getStatusBadgeClasses("sent");
      expect(classes).toContain("bg-[var(--primary)]/15");
      expect(classes).toContain("text-[var(--primary)]");
    });

    it("returns success classes for completed status", () => {
      const classes = getStatusBadgeClasses("completed");
      expect(classes).toContain("bg-[var(--success)]/15");
      expect(classes).toContain("text-[var(--success)]");
    });

    it("returns warning classes for pending status", () => {
      const classes = getStatusBadgeClasses("pending");
      expect(classes).toContain("bg-[var(--warning)]/15");
      expect(classes).toContain("text-[var(--warning)]");
    });

    it("returns danger classes for failed status", () => {
      const classes = getStatusBadgeClasses("failed");
      expect(classes).toContain("bg-[var(--error)]/15");
      expect(classes).toContain("text-[var(--error)]");
    });
  });

  describe("tone override", () => {
    it("uses tone override instead of status mapping", () => {
      // 'completed' normally maps to 'success', but we override to 'danger'
      const classes = getStatusBadgeClasses("completed", "danger");
      expect(classes).toContain("bg-[var(--error)]/15");
      expect(classes).toContain("text-[var(--error)]");
    });

    it("applies neutral override", () => {
      const classes = getStatusBadgeClasses("active", "neutral");
      expect(classes).toContain("bg-[var(--background-secondary)]");
    });

    it("applies info override", () => {
      const classes = getStatusBadgeClasses("failed", "info");
      expect(classes).toContain("bg-[var(--primary)]/15");
    });
  });
});

describe("formatStatusLabel", () => {
  describe("single word statuses", () => {
    it("capitalizes first letter", () => {
      expect(formatStatusLabel("pending")).toBe("Pending");
    });

    it("preserves already capitalized status", () => {
      expect(formatStatusLabel("Pending")).toBe("Pending");
    });

    it("handles all lowercase", () => {
      expect(formatStatusLabel("active")).toBe("Active");
    });
  });

  describe("underscore-separated statuses", () => {
    it("replaces underscores with spaces", () => {
      expect(formatStatusLabel("in_progress")).toBe("In Progress");
    });

    it("capitalizes each word", () => {
      expect(formatStatusLabel("pending_review")).toBe("Pending Review");
    });

    it("handles multiple underscores", () => {
      expect(formatStatusLabel("ready_for_review")).toBe("Ready For Review");
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(formatStatusLabel("")).toBe("");
    });

    it("handles single character", () => {
      expect(formatStatusLabel("a")).toBe("A");
    });

    it("handles status with numbers", () => {
      expect(formatStatusLabel("step_1_complete")).toBe("Step 1 Complete");
    });
  });
});
