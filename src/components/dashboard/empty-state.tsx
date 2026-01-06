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

export function EmptyLeads({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<LeadsIcon />}
      title="No leads yet"
      description="Inquiries from your portfolio websites, chat widget, and booking forms will appear here."
      action={{ label: "Portfolio Settings", href: "/portfolio" }}
      className={className}
    />
  );
}

export function EmptyInvoices({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<InvoiceIcon />}
      title="No invoices yet"
      description="Create invoices to bill clients for your photography services."
      action={{ label: "Create Invoice", href: "/invoices/new" }}
      className={className}
    />
  );
}

export function EmptyProjects({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<ProjectIcon />}
      title="No projects yet"
      description="Create projects to organize your work and track progress."
      action={{ label: "Create Project", href: "/projects/new" }}
      className={className}
    />
  );
}

export function EmptyOrders({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<OrderIcon />}
      title="No orders yet"
      description="Orders will appear here when clients place orders through your order pages."
      action={{ label: "Create Order Page", href: "/order-pages/new" }}
      className={className}
    />
  );
}

export function EmptyServices({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<ServiceIcon />}
      title="No services yet"
      description="Add services to define what you offer and set your pricing."
      action={{ label: "Add Service", href: "/services/new" }}
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

function LeadsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.569 1.175A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ProjectIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M3.75 2A1.75 1.75 0 0 0 2 3.75v3.5C2 8.216 2.784 9 3.75 9h3.5A1.75 1.75 0 0 0 9 7.25v-3.5A1.75 1.75 0 0 0 7.25 2h-3.5ZM3.5 3.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM3.75 11A1.75 1.75 0 0 0 2 12.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 9 16.25v-3.5A1.75 1.75 0 0 0 7.25 11h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM12.75 2A1.75 1.75 0 0 0 11 3.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 18 7.25v-3.5A1.75 1.75 0 0 0 16.25 2h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM12.75 11A1.75 1.75 0 0 0 11 12.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 18 16.25v-3.5A1.75 1.75 0 0 0 16.25 11h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19H16.16a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
    </svg>
  );
}

function ServiceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v.258a33.186 33.186 0 0 1 6.668.83.75.75 0 0 1-.336 1.461 31.28 31.28 0 0 0-1.103-.232l1.702 7.545a.75.75 0 0 1-.387.832A4.981 4.981 0 0 1 15 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 0 1-.387-.832l1.77-7.849a31.743 31.743 0 0 0-3.339-.254v11.505l6.062 1.208a.75.75 0 0 1-.148 1.486l-12.906-2.573a.75.75 0 0 1 .148-1.486l5.094 1.015V4.508a31.728 31.728 0 0 0-3.339.254l1.77 7.85a.75.75 0 0 1-.387.831A4.981 4.981 0 0 1 5 14a4.98 4.98 0 0 1-2.294-.556.75.75 0 0 1-.387-.832L4.02 5.067c-.386.07-.768.145-1.144.224a.75.75 0 1 1-.334-1.462 33.186 33.186 0 0 1 6.708-.83V2.75A.75.75 0 0 1 10 2ZM5 12.957l-.975-4.323c-.307.065-.609.135-.904.21l.879 4.113ZM6.879 12.957l.879-4.113a29.68 29.68 0 0 0-.904-.21L5.879 12.957h1Zm8.121 0l-.975-4.323c-.307.065-.609.135-.904.21l.879 4.113Zm-1.121 0l.879-4.113a29.688 29.688 0 0 0-.904-.21L13.879 12.957h1.121Z" clipRule="evenodd" />
    </svg>
  );
}
