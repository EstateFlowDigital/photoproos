import { Suspense } from "react";
import { ContentCalendarClient } from "./calendar-client";
import {
  getContentCalendarSummary,
  getDraftPages,
  getScheduledPages,
} from "@/lib/actions/marketing-cms";

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[600px] bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
        <div className="h-[400px] bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

// Get date range for current month
function getMonthRange() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0); // End of next month
  return { startDate, endDate };
}

// Calendar content with data fetching
async function CalendarContent() {
  const { startDate, endDate } = getMonthRange();

  // Fetch data in parallel
  const [calendarSummaryResult, scheduledPagesResult, draftPagesResult] =
    await Promise.all([
      getContentCalendarSummary(startDate, endDate),
      getScheduledPages({ startDate, endDate }),
      getDraftPages(),
    ]);

  const calendarSummary = calendarSummaryResult.success && calendarSummaryResult.data
    ? calendarSummaryResult.data
    : { scheduled: [], drafts: [], published: [] };

  const scheduledPages = scheduledPagesResult.success && Array.isArray(scheduledPagesResult.data)
    ? scheduledPagesResult.data
    : [];

  const draftPages = draftPagesResult.success && Array.isArray(draftPagesResult.data)
    ? draftPagesResult.data
    : [];

  return (
    <ContentCalendarClient
      initialMonth={new Date()}
      calendarSummary={calendarSummary}
      scheduledPages={scheduledPages}
      draftPages={draftPages}
    />
  );
}

export default function ContentCalendarPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CalendarContent />
    </Suspense>
  );
}
