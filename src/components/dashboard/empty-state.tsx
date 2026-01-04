import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  variant?: "default" | "compact";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  className,
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] text-center",
        isCompact ? "density-padding-sm" : "density-padding-lg",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "mx-auto flex items-center justify-center rounded-full bg-[var(--background-secondary)]",
            isCompact ? "h-10 w-10" : "h-12 w-12"
          )}
        >
          <div className={cn("text-foreground-muted", isCompact ? "h-5 w-5" : "h-6 w-6")}>
            {icon}
          </div>
        </div>
      )}
      <h3
        className={cn(
          "font-medium text-foreground",
          icon && "mt-3",
          isCompact ? "text-sm" : "text-base"
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "text-foreground-muted",
          isCompact ? "mt-1 text-xs" : "mt-2 text-sm",
          "max-w-sm mx-auto"
        )}
      >
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className={cn("flex items-center justify-center gap-3", isCompact ? "mt-4" : "mt-5")}>
          {action && (
            <Link
              href={action.href}
              className={cn(
                "inline-flex items-center rounded-lg bg-[var(--primary)] font-medium text-white transition-colors hover:bg-[var(--primary)]/90",
                isCompact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
              )}
            >
              {action.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className={cn(
                "inline-flex items-center rounded-lg border border-[var(--card-border)] font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]",
                isCompact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
              )}
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states for common scenarios
export function EmptyGalleries({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<GalleryIcon />}
      title="No galleries yet"
      description="Create your first gallery to start delivering photos to clients and getting paid."
      action={{ label: "Create Gallery", href: "/galleries/new" }}
      className={className}
    />
  );
}

export function EmptyBookings({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<CalendarIcon />}
      title="No upcoming bookings"
      description="Schedule your next photo session to keep your calendar busy."
      action={{ label: "New Booking", href: "/scheduling/new" }}
      variant="compact"
      className={className}
    />
  );
}

export function EmptyActivity({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<ActivityIcon />}
      title="No recent activity"
      description="Activity will appear here as you work with clients and galleries."
      variant="compact"
      className={className}
    />
  );
}

export function EmptyClients({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<ClientIcon />}
      title="No clients yet"
      description="Add your first client to start managing your photography business."
      action={{ label: "Add Client", href: "/clients/new" }}
      className={className}
    />
  );
}

export function EmptyPayments({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<PaymentIcon />}
      title="No payments yet"
      description="Payments will appear here when clients pay for galleries or invoices."
      action={{ label: "Create Invoice", href: "/invoices/new" }}
      className={className}
    />
  );
}

// Icons
function GalleryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
    </svg>
  );
}

function ClientIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}
