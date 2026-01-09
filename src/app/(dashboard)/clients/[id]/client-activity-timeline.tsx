"use client";

import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "payment" | "gallery" | "email" | "booking" | "communication" | "invoice";
  title: string;
  description?: string;
  timestamp: Date;
  status?: "success" | "pending" | "error" | "info";
  metadata?: Record<string, string | number>;
}

interface ClientActivityTimelineProps {
  activities: ActivityItem[];
}

const activityIcons: Record<ActivityItem["type"], React.ReactNode> = {
  payment: <PaymentIcon className="h-4 w-4" />,
  gallery: <GalleryIcon className="h-4 w-4" />,
  email: <EmailIcon className="h-4 w-4" />,
  booking: <BookingIcon className="h-4 w-4" />,
  communication: <CommunicationIcon className="h-4 w-4" />,
  invoice: <InvoiceIcon className="h-4 w-4" />,
};

const activityColors: Record<ActivityItem["type"], string> = {
  payment: "bg-[var(--success)]/10 text-[var(--success)]",
  gallery: "bg-[var(--primary)]/10 text-[var(--primary)]",
  email: "bg-blue-500/10 text-blue-400",
  booking: "bg-purple-500/10 text-purple-400",
  communication: "bg-orange-500/10 text-orange-400",
  invoice: "bg-emerald-500/10 text-emerald-400",
};

const statusColors: Record<NonNullable<ActivityItem["status"]>, string> = {
  success: "bg-[var(--success)]/10 text-[var(--success)]",
  pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
  error: "bg-[var(--error)]/10 text-[var(--error)]",
  info: "bg-blue-500/10 text-blue-400",
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: days > 365 ? "numeric" : undefined });
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return "Just now";
  }
}

export function ClientActivityTimeline({ activities }: ClientActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Activity Timeline</h2>
        <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center">
          <TimelineIcon className="mx-auto h-10 w-10 text-foreground-muted" />
          <p className="mt-3 text-sm text-foreground">No activity yet</p>
          <p className="mt-1 text-xs text-foreground-muted">Client activities will appear here</p>
        </div>
      </div>
    );
  }

  // Sort activities by timestamp (most recent first)
  const sortedActivities = [...activities].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Activity Timeline</h2>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--card-border)]" />

        <div className="space-y-4">
          {sortedActivities.map((activity) => (
            <div key={activity.id} className="relative flex gap-4 pl-10">
              {/* Icon circle */}
              <div className={cn(
                "absolute left-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                activityColors[activity.type]
              )}>
                {activityIcons[activity.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-foreground-muted mt-0.5 line-clamp-2">{activity.description}</p>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {activity.status && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                        statusColors[activity.status]
                      )}>
                        {activity.status}
                      </span>
                    )}
                    <span className="text-xs text-foreground-muted whitespace-nowrap">
                      {formatRelativeTime(new Date(activity.timestamp))}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center rounded-md bg-[var(--background-tertiary)] px-2 py-1 text-xs text-foreground-muted"
                      >
                        {key}: {typeof value === "number" && key.toLowerCase().includes("amount")
                          ? `$${(value / 100).toFixed(0)}`
                          : value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Icons
function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm12 4a3 3 0 11-6 0 3 3 0 016 0zM4 9a1 1 0 100-2 1 1 0 000 2zm13-1a1 1 0 11-2 0 1 1 0 012 0zM1.75 14.5a.75.75 0 000 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 00-1.5 0v.784a.272.272 0 01-.35.25A49.043 49.043 0 001.75 14.5z" clipRule="evenodd" />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
    </svg>
  );
}

function BookingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
    </svg>
  );
}

function CommunicationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 01-5.183.501.78.78 0 00-.528.224l-3.579 3.58A.75.75 0 016 17.25v-3.443a41.033 41.033 0 01-2.57-.33C1.993 13.244 1 11.986 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902z" clipRule="evenodd" />
    </svg>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
    </svg>
  );
}

function TimelineIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
    </svg>
  );
}
