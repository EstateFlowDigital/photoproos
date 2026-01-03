/**
 * Booking utility functions (non-server-action helpers)
 */

import type { RecurrencePattern } from "@prisma/client";
export type { RecurrencePattern };

/**
 * Get recurrence summary text for display
 */
export function getRecurrenceSummary(
  pattern: RecurrencePattern,
  interval: number = 1,
  daysOfWeek?: number[]
): string {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  switch (pattern) {
    case "daily":
      return interval === 1 ? "Daily" : `Every ${interval} days`;
    case "weekly":
      return interval === 1 ? "Weekly" : `Every ${interval} weeks`;
    case "biweekly":
      return "Every 2 weeks";
    case "monthly":
      return interval === 1 ? "Monthly" : `Every ${interval} months`;
    case "custom":
      if (daysOfWeek && daysOfWeek.length > 0) {
        const days = daysOfWeek.map((d) => dayNames[d]).join(", ");
        return `Weekly on ${days}`;
      }
      return "Custom schedule";
    default:
      return "Recurring";
  }
}
