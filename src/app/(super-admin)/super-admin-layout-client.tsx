"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState, useTransition } from "react";
import { getActiveImpersonation, endImpersonation } from "@/lib/actions/super-admin";
import { toast } from "sonner";
import { ElementInspector } from "@/components/dev/element-inspector";
import { ErrorTracker } from "@/components/dev/error-tracker";

// Icons
function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 7 6-3 6 3 6-3v13l-6 3-6-3-6 3z" />
      <path d="M9 4v13" />
      <path d="M15 7v13" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function DollarSignIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/super-admin/users", label: "Users", icon: UsersIcon },
  { href: "/super-admin/revenue", label: "Revenue", icon: DollarSignIcon },
  { href: "/super-admin/engagement", label: "Engagement", icon: ActivityIcon },
  { href: "/super-admin/discounts", label: "Discounts", icon: TagIcon },
  { href: "/super-admin/announcements", label: "Announcements", icon: MegaphoneIcon },
  { href: "/super-admin/support", label: "Support", icon: TicketIcon },
  { href: "/super-admin/feedback", label: "Feedback", icon: MessageSquareIcon },
  { href: "/super-admin/roadmap", label: "Roadmap", icon: MapIcon },
  { href: "/super-admin/logs", label: "System Logs", icon: FileTextIcon },
  { href: "/super-admin/developer", label: "Developer", icon: CodeIcon },
  { href: "/super-admin/config", label: "Configuration", icon: SettingsIcon },
];

interface SuperAdminLayoutClientProps {
  children: React.ReactNode;
  adminUser: {
    id: string;
    email: string;
    name: string;
    imageUrl: string;
  } | null;
}

export function SuperAdminLayoutClient({
  children,
  adminUser,
}: SuperAdminLayoutClientProps) {
  const pathname = usePathname();
  const [impersonation, setImpersonation] = useState<{
    userId: string;
    reason: string | null;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function checkImpersonation() {
      const result = await getActiveImpersonation();
      if (result.success && result.data) {
        setImpersonation(result.data);
      }
    }
    checkImpersonation();
  }, []);

  const handleEndImpersonation = () => {
    startTransition(async () => {
      const result = await endImpersonation();
      if (result.success) {
        setImpersonation(null);
        toast.success("Impersonation ended");
      } else {
        toast.error(result.error || "Failed to end impersonation");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Impersonation Banner */}
      {impersonation && (
        <div
          className={cn(
            "sticky top-0 z-[60] px-4 py-2",
            "bg-[var(--warning)] text-black",
            "flex items-start justify-between gap-4 flex-wrap"
          )}
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-sm font-medium">
              Impersonating user: {impersonation.userId}
              {impersonation.reason && ` — ${impersonation.reason}`}
            </span>
          </div>
          <button
            onClick={handleEndImpersonation}
            disabled={isPending}
            className={cn(
              "px-3 py-1 text-sm font-medium rounded",
              "bg-black/20 hover:bg-black/30",
              "transition-colors",
              isPending && "opacity-50 cursor-not-allowed"
            )}
          >
            {isPending ? "Ending..." : "End Impersonation"}
          </button>
        </div>
      )}

      {/* Top bar */}
      <header
        className={cn(
          "sticky z-50 h-14",
          impersonation ? "top-10" : "top-0",
          "border-b border-[var(--border)]",
          "bg-[var(--card)]"
        )}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap h-full px-6">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2",
                "text-sm text-[var(--foreground-muted)]",
                "hover:text-[var(--foreground)]",
                "transition-colors"
              )}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to App
            </Link>
            <div className="w-px h-5 bg-[var(--border)]" />
            <div className="flex items-center gap-2">
              <ShieldIcon className="w-5 h-5 text-[var(--warning)]" />
              <span className="font-semibold text-[var(--foreground)]">
                Super Admin
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--foreground-muted)]">
              {adminUser?.name || adminUser?.email}
            </span>
            {adminUser?.imageUrl && (
              <img
                src={adminUser.imageUrl}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "sticky h-[calc(100vh-3.5rem)]",
            impersonation ? "top-24" : "top-14",
            "w-64 flex-shrink-0",
            "border-r border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/super-admin" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg",
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-6">{children}</main>
      </div>

      {/* Dev Tools */}
      <ElementInspector />
      <ErrorTracker />
    </div>
  );
}
