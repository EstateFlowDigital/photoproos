"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutClient } from "@/lib/actions/client-auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Camera,
  LogOut,
  Loader2,
  Home,
  Images,
  FileText,
  Download,
  Heart,
  FileCheck,
  Calendar,
  CreditCard,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";

interface PortalPageWrapperProps {
  children: React.ReactNode;
  clientName?: string;
  clientEmail?: string;
  organizationName?: string;
  organizationLogo?: string | null;
}

const navItems = [
  { href: "/portal", label: "Home", icon: Home },
  { href: "/portal/galleries", label: "Galleries", icon: Images },
  { href: "/portal/downloads", label: "Downloads", icon: Download },
  { href: "/portal/favorites", label: "Favorites", icon: Heart },
  { href: "/portal/contracts", label: "Contracts", icon: FileCheck },
  { href: "/portal/questionnaires", label: "Questionnaires", icon: FileText },
  { href: "/portal/schedule", label: "Schedule", icon: Calendar },
  { href: "/portal/payments", label: "Payments", icon: CreditCard },
];

export function PortalPageWrapper({
  children,
  clientName,
  clientEmail,
  organizationName,
  organizationLogo,
}: PortalPageWrapperProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const displayName = clientName || (clientEmail || "Guest").split("@")[0];
  const firstLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutClient();
    window.location.href = "/portal/login";
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Logo & Nav Toggle */}
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--background-tertiary)] sm:hidden"
                aria-label="Toggle menu"
              >
                {isMobileNavOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              {/* Logo */}
              <Link href="/portal" className="flex items-center gap-3">
                {organizationLogo ? (
                  <img
                    src={organizationLogo}
                    alt={organizationName || "Logo"}
                    className="h-9 w-auto max-w-[120px] object-contain"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="hidden text-lg font-semibold text-[var(--foreground)] sm:block">
                  {organizationName || "Client Portal"}
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.slice(0, 5).map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/portal" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: User & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />

              {/* User Avatar & Name (hidden on mobile) */}
              <div className="hidden items-center gap-3 sm:flex">
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--foreground)]">{displayName}</p>
                  {clientEmail && (
                    <p className="text-xs text-[var(--foreground-muted)]">{clientEmail}</p>
                  )}
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-medium text-[var(--primary)]">
                  {firstLetter}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)] disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{isLoggingOut ? "..." : "Sign out"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileNavOpen && (
          <div className="border-t border-[var(--card-border)] bg-[var(--card)] px-4 py-3 sm:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/portal" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Info */}
            <div className="mt-3 border-t border-[var(--card-border)] pt-3">
              <div className="flex items-center gap-3 px-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-medium text-[var(--primary)]">
                  {firstLetter}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{displayName}</p>
                  {clientEmail && (
                    <p className="text-xs text-[var(--foreground-muted)]">{clientEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Back Link (for sub-pages) */}
      {pathname !== "/portal" && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-secondary)] transition-colors hover:text-[var(--foreground)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Portal
          </Link>
        </div>
      )}

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] bg-[var(--card)] py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-[var(--foreground-muted)]">
              {organizationName || "PhotoProOS"} Client Portal
            </p>
            <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
              <Link href="/help" className="hover:text-[var(--foreground)]">
                Help
              </Link>
              <Link href="/contact" className="hover:text-[var(--foreground)]">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PortalPageWrapper;
