export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { getBookingForms } from "@/lib/actions/booking-forms";

export default async function MiniSessionsPage() {
  const bookingForms = await getBookingForms();
  const miniForms = bookingForms.filter((form) => (
    /mini/i.test(form.name) || /mini/i.test(form.slug)
  ));

  const publishedCount = miniForms.filter((form) => form.isPublished).length;
  const totalBookings = miniForms.reduce((sum, form) => sum + form.bookingCount, 0);
  const totalSubmissions = miniForms.reduce((sum, form) => sum + form.submissionCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mini Sessions"
        subtitle="Launch high-volume session days with streamlined booking and delivery"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/scheduling/booking-forms"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <FormIcon className="h-4 w-4" />
              Manage Forms
            </Link>
            <Link
              href="/scheduling/availability"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <CalendarIcon className="h-4 w-4" />
              Set Availability
            </Link>
          </div>
        }
      />

      <div className="auto-grid grid-min-200 grid-gap-3">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Mini Session Forms</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{miniForms.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Published</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{publishedCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Bookings</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalBookings}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Submissions</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalSubmissions}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Mini Session Forms</h2>
            <Link
              href="/scheduling/booking-forms"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View all forms
            </Link>
          </div>

          {miniForms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
              <FormIcon className="mx-auto h-10 w-10 text-foreground-muted" />
              <p className="mt-3 text-sm font-medium text-foreground">No mini session forms yet</p>
              <p className="mt-1 text-xs text-foreground-muted">
                Create a booking form with “mini” in the name to track mini sessions here.
              </p>
              <Link
                href="/scheduling/booking-forms"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <PlusIcon className="h-4 w-4" />
                Create Form
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {miniForms.slice(0, 6).map((form) => (
                <div
                  key={form.id}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/scheduling/booking-forms/${form.id}`}
                        className="text-sm font-semibold text-foreground hover:underline"
                      >
                        {form.name}
                      </Link>
                      <p className="mt-1 text-xs text-foreground-muted">
                        {form.submissionCount} submissions • {form.bookingCount} bookings
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          form.isPublished
                            ? "bg-[var(--success)]/10 text-[var(--success)]"
                            : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                        }`}
                      >
                        {form.isPublished ? "Published" : "Draft"}
                      </span>
                      {form.isPublished && (
                        <Link
                          href={`/book/${form.slug}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--card-border)] px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-[var(--background-hover)]"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          Public Link
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground">Mini Session Playbook</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground-secondary">
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                Set availability blocks for the session day.
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                Use shorter booking types with buffer time.
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                Require approval to control slot volume.
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                Deliver galleries in batches after the event.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
            <div className="mt-3 space-y-2">
              <Link
                href="/scheduling/types"
                className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <TagIcon className="h-4 w-4 text-foreground-muted" />
                Booking Types
              </Link>
              <Link
                href="/scheduling/booking-forms"
                className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <FormIcon className="h-4 w-4 text-foreground-muted" />
                Booking Forms
              </Link>
              <Link
                href="/galleries"
                className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <GalleryIcon className="h-4 w-4 text-foreground-muted" />
                Deliver Galleries
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function FormIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v4.086c0 .597.237 1.17.659 1.591l6.414 6.414a2.25 2.25 0 0 0 3.182 0l4.086-4.086a2.25 2.25 0 0 0 0-3.182L9.927 2.659A2.25 2.25 0 0 0 8.336 2H4.25Zm1.5 4.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.586 3.586a2 2 0 0 1 2.828 2.828l-3 3a2 2 0 0 1-2.828 0 .75.75 0 0 1 1.06-1.06 0.5 0.5 0 0 0 .708 0l3-3a.5.5 0 1 0-.708-.708l-1.5 1.5a.75.75 0 0 1-1.06-1.06l1.5-1.5Zm-5.172 12.828a2 2 0 0 1-2.828-2.828l3-3a2 2 0 0 1 2.828 0 .75.75 0 0 1-1.06 1.06 0.5 0.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708l1.5-1.5a.75.75 0 0 1 1.06 1.06l-1.5 1.5Z" clipRule="evenodd" />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.5a1 1 0 0 1-1.415.001L3.29 9.704a1 1 0 1 1 1.42-1.408l3.086 3.113 6.792-6.82a1 1 0 0 1 1.414 0Z" clipRule="evenodd" />
    </svg>
  );
}
