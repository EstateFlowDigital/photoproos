import { describe, it, expect } from "vitest";
import { getRecurrenceSummary } from "./bookings";
import type { RecurrencePattern } from "./bookings";

describe("getRecurrenceSummary", () => {
  describe("daily pattern", () => {
    it("returns 'Daily' for interval of 1", () => {
      expect(getRecurrenceSummary("daily" as RecurrencePattern, 1)).toBe(
        "Daily"
      );
    });

    it("returns 'Every N days' for intervals greater than 1", () => {
      expect(getRecurrenceSummary("daily" as RecurrencePattern, 2)).toBe(
        "Every 2 days"
      );
      expect(getRecurrenceSummary("daily" as RecurrencePattern, 5)).toBe(
        "Every 5 days"
      );
    });
  });

  describe("weekly pattern", () => {
    it("returns 'Weekly' for interval of 1", () => {
      expect(getRecurrenceSummary("weekly" as RecurrencePattern, 1)).toBe(
        "Weekly"
      );
    });

    it("returns 'Every N weeks' for intervals greater than 1", () => {
      expect(getRecurrenceSummary("weekly" as RecurrencePattern, 3)).toBe(
        "Every 3 weeks"
      );
      expect(getRecurrenceSummary("weekly" as RecurrencePattern, 4)).toBe(
        "Every 4 weeks"
      );
    });
  });

  describe("biweekly pattern", () => {
    it("always returns 'Every 2 weeks' regardless of interval", () => {
      expect(getRecurrenceSummary("biweekly" as RecurrencePattern, 1)).toBe(
        "Every 2 weeks"
      );
      expect(getRecurrenceSummary("biweekly" as RecurrencePattern, 3)).toBe(
        "Every 2 weeks"
      );
    });
  });

  describe("monthly pattern", () => {
    it("returns 'Monthly' for interval of 1", () => {
      expect(getRecurrenceSummary("monthly" as RecurrencePattern, 1)).toBe(
        "Monthly"
      );
    });

    it("returns 'Every N months' for intervals greater than 1", () => {
      expect(getRecurrenceSummary("monthly" as RecurrencePattern, 2)).toBe(
        "Every 2 months"
      );
      expect(getRecurrenceSummary("monthly" as RecurrencePattern, 6)).toBe(
        "Every 6 months"
      );
    });
  });

  describe("custom pattern", () => {
    it("returns 'Custom schedule' when no days of week specified", () => {
      expect(getRecurrenceSummary("custom" as RecurrencePattern, 1)).toBe(
        "Custom schedule"
      );
    });

    it("returns 'Custom schedule' when empty days of week array", () => {
      expect(getRecurrenceSummary("custom" as RecurrencePattern, 1, [])).toBe(
        "Custom schedule"
      );
    });

    it("returns 'Weekly on [days]' when days of week specified", () => {
      // Sunday = 0, Monday = 1, etc.
      expect(
        getRecurrenceSummary("custom" as RecurrencePattern, 1, [1])
      ).toBe("Weekly on Mon");

      expect(
        getRecurrenceSummary("custom" as RecurrencePattern, 1, [1, 3, 5])
      ).toBe("Weekly on Mon, Wed, Fri");

      expect(
        getRecurrenceSummary("custom" as RecurrencePattern, 1, [0, 6])
      ).toBe("Weekly on Sun, Sat");
    });

    it("handles all days of week", () => {
      expect(
        getRecurrenceSummary(
          "custom" as RecurrencePattern,
          1,
          [0, 1, 2, 3, 4, 5, 6]
        )
      ).toBe("Weekly on Sun, Mon, Tue, Wed, Thu, Fri, Sat");
    });
  });

  describe("default interval", () => {
    it("uses default interval of 1 when not specified", () => {
      expect(getRecurrenceSummary("daily" as RecurrencePattern)).toBe("Daily");
      expect(getRecurrenceSummary("weekly" as RecurrencePattern)).toBe(
        "Weekly"
      );
      expect(getRecurrenceSummary("monthly" as RecurrencePattern)).toBe(
        "Monthly"
      );
    });
  });

  describe("unknown pattern", () => {
    it("returns 'Recurring' for unrecognized patterns", () => {
      expect(
        getRecurrenceSummary("unknown" as RecurrencePattern, 1)
      ).toBe("Recurring");
      expect(
        getRecurrenceSummary("yearly" as RecurrencePattern, 1)
      ).toBe("Recurring");
    });
  });
});
