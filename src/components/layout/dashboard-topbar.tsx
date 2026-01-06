"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { QuickThemeSwitcher } from "@/components/ui/quick-theme-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { KeyboardShortcutsModal } from "@/components/ui/keyboard-shortcuts-modal";
import { ChevronDown } from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationData,
} from "@/lib/actions/notifications";
import { globalSearch, type SearchResult as GlobalSearchResult } from "@/lib/actions/search";
import { QuickActions, QUICK_ACTIONS } from "@/components/dashboard/quick-actions";
import { useStableOrgProfile } from "@/hooks/use-stable-org-profile";
import { getNotificationType } from "@/lib/constants";

type NotificationCache = {
  data: DisplayNotification[];
  unread: number;
  timestamp: number;
};

const NOTIFICATION_CACHE_TTL_MS = 60_000;
let notificationCache: NotificationCache | null = null;

interface DashboardTopbarProps {
  className?: string;
  navLinks?: {
    id: string;
    label: string;
    href: string;
    [key: string]: unknown;
  }[];
  navMode?: "sidebar" | "top";
  onNavModeChange?: (mode: "sidebar" | "top") => void;
  navAutoForced?: boolean;
}

// Notification type for UI display
interface DisplayNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

// Helper to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString();
}

// Notification type mapping imported from @/lib/constants
const mapNotificationType = getNotificationType;

// Search result interface for display
interface SearchResult {
  id: string;
  type: "gallery" | "client" | "payment" | "property" | "service" | "invoice" | "booking";
  title: string;
  subtitle: string;
  url: string;
}

export function DashboardTopbar({ className, navLinks: _navLinks = [], navMode: _navMode = "sidebar", navAutoForced: _navAutoForced = false, onNavModeChange: _onNavModeChange }: DashboardTopbarProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentResults, setRecentResults] = useState<SearchResult[]>([]);
  const [activeTypes, setActiveTypes] = useState<SearchResult["type"][]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const latestSearchTokenRef = useRef<string>("");
  const { user, organization } = useStableOrgProfile();

  const userDisplayName = React.useMemo(() => {
    if (!user) return "Workspace";
    const anyUser: any = user;
    return (
      anyUser.fullName ||
      anyUser.username ||
      anyUser.firstName ||
      anyUser.emailAddress ||
      anyUser.primaryEmailAddress?.emailAddress ||
      "Workspace"
    );
  }, [user]);

  const userSecondary = React.useMemo(() => {
    const anyUser: any = user;
    const email =
      anyUser?.primaryEmailAddress?.emailAddress || anyUser?.emailAddress || null;
    return organization?.slug || email || "Signed in";
  }, [organization, user]);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const linkLoggerRef = useRef<boolean>(false);

  const closeAllPopovers = useCallback(() => {
    setSearchOpen(false);
    setWorkspaceOpen(false);
    setQuickActionsOpen(false);
    setNotificationsOpen(false);
    setHelpOpen(false);
    setShortcutsOpen(false);
  }, []);

  // Close all popovers when route changes to avoid stale overlays blocking clicks
  useEffect(() => {
    closeAllPopovers();
    setSearchQuery("");
    setSearchResults([]);
  }, [closeAllPopovers, pathname]);

  // Fetch notifications on mount with simple cache
  useEffect(() => {
    let cancelled = false;

    const hydrateFromCache = () => {
      if (
        notificationCache &&
        Date.now() - notificationCache.timestamp < NOTIFICATION_CACHE_TTL_MS
      ) {
        setNotifications(notificationCache.data);
        setUnreadCount(notificationCache.unread);
        setIsLoadingNotifications(false);
        return true;
      }
      return false;
    };

    if (hydrateFromCache()) {
      return () => {
        cancelled = true;
      };
    }

    async function fetchNotifications() {
      try {
        const result = await getNotifications(10);
        if (result.success) {
          const displayNotifications: DisplayNotification[] = result.data.notifications.map((n) => ({
            id: n.id,
            type: mapNotificationType(n.type),
            title: n.title,
            message: n.message,
            time: formatRelativeTime(n.createdAt),
            unread: !n.read,
          }));
          if (!cancelled) {
            setNotifications(displayNotifications);
            setUnreadCount(result.data.unreadCount);
            notificationCache = {
              data: displayNotifications,
              unread: result.data.unreadCount,
              timestamp: Date.now(),
            };
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch notifications:", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingNotifications(false);
        }
      }
    }
    fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform actual search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const performSearch = async () => {
      const token = crypto.randomUUID();
      latestSearchTokenRef.current = token;
      setIsSearching(true);
      try {
        const results = await globalSearch(debouncedQuery);

        // Ignore if a newer search started
        if (latestSearchTokenRef.current !== token) return;

        const allResults: SearchResult[] = [
          ...results.clients.map((c) => ({
            id: c.id,
            type: "client" as const,
            title: c.title,
            subtitle: c.subtitle || "",
            url: c.href,
          })),
          ...results.galleries.map((g) => ({
            id: g.id,
            type: "gallery" as const,
            title: g.title,
            subtitle: g.subtitle || "",
            url: g.href,
          })),
          ...results.properties.map((p) => ({
            id: p.id,
            type: "property" as const,
            title: p.title,
            subtitle: p.subtitle || "",
            url: p.href,
          })),
          ...results.services.map((s) => ({
            id: s.id,
            type: "service" as const,
            title: s.title,
            subtitle: s.subtitle || "",
            url: s.href,
          })),
          ...results.invoices.map((i) => ({
            id: i.id,
            type: "invoice" as const,
            title: i.title,
            subtitle: i.subtitle || "",
            url: i.href,
          })),
          ...results.bookings.map((b) => ({
            id: b.id,
            type: "booking" as const,
            title: b.title,
            subtitle: b.subtitle || "",
            url: b.href,
          })),
        ];
        setSearchResults(allResults);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // Load recent results
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("ppos_recent_search");
    if (stored) {
      try {
        setRecentResults(JSON.parse(stored) as SearchResult[]);
      } catch {
        setRecentResults([]);
      }
    }
  }, []);

  const persistRecent = (next: SearchResult[]) => {
    setRecentResults(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ppos_recent_search", JSON.stringify(next.slice(0, 6)));
    }
  };

  // Search query update handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
    }
  }, []);

  const handleSearchSelect = (result: SearchResult) => {
    router.push(result.url);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    const nextRecent = [result, ...recentResults.filter((r) => !(r.id === result.id && r.type === result.type))].slice(0, 6);
    persistRecent(nextRecent);
    setQuickActionsOpen(false);
    setNotificationsOpen(false);
    setHelpOpen(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }

      if (!isTyping && e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }

      // Open keyboard shortcuts modal with Cmd/Ctrl + Shift + /
      if ((e.metaKey || e.ctrlKey) && (e.key === "?" || (e.shiftKey && e.key === "/"))) {
        e.preventDefault();
        setShortcutsOpen(true);
      }

      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setHelpOpen(false);
        setQuickActionsOpen(false);
        setShortcutsOpen(false);
        setWorkspaceOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdowns when clicking/tapping outside
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (
        searchRef.current?.contains(e.target as Node) ||
        quickActionsRef.current?.contains(e.target as Node) ||
        notificationsRef.current?.contains(e.target as Node) ||
        helpRef.current?.contains(e.target as Node) ||
        workspaceRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      closeAllPopovers();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [closeAllPopovers]);

  // Close popovers when the user scrolls the page to avoid invisible overlays blocking clicks
  useEffect(() => {
    const handleScroll = () => closeAllPopovers();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [closeAllPopovers]);

  // Debug: surface any prevented link clicks to help trace blocking overlays/extensions
  useEffect(() => {
    if (linkLoggerRef.current) return;
    linkLoggerRef.current = true;
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (anchor && e.defaultPrevented) {
        console.warn("Link click prevented", { href: anchor.getAttribute("href") });
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const markAllAsRead = async () => {
    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);
    // Persist to database
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const markAsRead = async (id: string) => {
    // Optimistically update UI
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    // Persist to database
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment": return <PaymentIcon className="h-4 w-4 text-[var(--success)]" />;
      case "payment_failed": return <PaymentIcon className="h-4 w-4 text-[var(--error)]" />;
      case "view": return <EyeIcon className="h-4 w-4 text-[var(--primary)]" />;
      case "gallery": return <GalleryIcon className="h-4 w-4 text-[var(--success)]" />;
      case "download": return <DownloadIcon className="h-4 w-4 text-[var(--primary)]" />;
      case "comment": return <CommentIcon className="h-4 w-4 text-[var(--warning)]" />;
      case "expiring": return <ClockIcon className="h-4 w-4 text-[var(--error)]" />;
      case "contract": return <ContractIcon className="h-4 w-4 text-[var(--primary)]" />;
      case "booking": return <CalendarIcon className="h-4 w-4 text-[var(--primary)]" />;
      case "booking_cancelled": return <CalendarIcon className="h-4 w-4 text-[var(--error)]" />;
      case "reminder": return <ClockIcon className="h-4 w-4 text-[var(--warning)]" />;
      case "invoice": return <InvoiceIcon className="h-4 w-4 text-[var(--primary)]" />;
      case "questionnaire": return <ClipboardIcon className="h-4 w-4 text-[var(--primary)]" />;
      case "questionnaire_done": return <ClipboardIcon className="h-4 w-4 text-[var(--success)]" />;
      case "lead": return <UserPlusIcon className="h-4 w-4 text-[var(--primary)]" />;
      case "client": return <UserIcon className="h-4 w-4 text-[var(--success)]" />;
      default: return <BellIcon className="h-4 w-4" />;
    }
  };

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "gallery": return <GalleryIcon className="h-4 w-4" />;
      case "client": return <UserIcon className="h-4 w-4" />;
      case "payment": return <PaymentIcon className="h-4 w-4" />;
      case "property": return <PropertyIcon className="h-4 w-4" />;
      case "service": return <ServiceIcon className="h-4 w-4" />;
      case "invoice": return <InvoiceIcon className="h-4 w-4" />;
      case "booking": return <CalendarIcon className="h-4 w-4" />;
      default: return <SearchIcon className="h-4 w-4" />;
    }
  };

  const toggleType = (type: SearchResult["type"]) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filteredResults =
    activeTypes.length > 0
      ? searchResults.filter((r) => activeTypes.includes(r.type))
      : searchResults;

  return (
    <>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-3 sm:min-h-[64px] sm:flex-nowrap sm:py-0 lg:px-6",
          className
        )}
      >
      {/* Left side - search icon */}
      <div className="order-2 flex w-full flex-1 items-center gap-2 sm:order-1 sm:w-auto">
        <button
          type="button"
          onClick={() => {
            setSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 0);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--card-border)] text-foreground transition-colors hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          aria-label="Search"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Right side - Actions */}
      <div className="order-1 flex items-center gap-2 sm:order-2">

        {/* Quick actions popup */}
        <div ref={quickActionsRef} className="relative">
          <button
            type="button"
            onClick={() => setQuickActionsOpen((prev) => !prev)}
            className="flex h-9 items-center gap-2 rounded-lg border border-[var(--card-border)] px-3 text-sm font-medium text-foreground transition-all hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden lg:inline">Quick Actions</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                quickActionsOpen ? "rotate-180" : "rotate-0"
              )}
            />
          </button>
          {quickActionsOpen && (
            <div className="fixed inset-x-3 top-[72px] z-50 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[clamp(260px,70vw,440px)]">
              <QuickActions className="grid grid-cols-1 gap-2" actions={QUICK_ACTIONS} />
            </div>
          )}
        </div>

        {/* Workspace / account dropdown */}
        <div ref={workspaceRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setWorkspaceOpen((prev) => !prev);
              setQuickActionsOpen(false);
              setNotificationsOpen(false);
              setHelpOpen(false);
            }}
            className="flex h-9 items-center gap-2 rounded-lg border border-[var(--card-border)] px-3 text-sm font-medium text-foreground transition-all hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          >
            <UserIcon className="h-4 w-4" />
            <span className="hidden md:inline truncate max-w-[160px]">
              {organization?.name || userDisplayName}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                workspaceOpen ? "rotate-180" : "rotate-0"
              )}
            />
          </button>
          {workspaceOpen && (
            <div className="fixed inset-x-3 top-[72px] z-50 rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[clamp(260px,70vw,440px)]">
              <div className="px-4 py-3 border-b border-[var(--card-border)]">
                <p className="text-sm font-semibold text-foreground truncate">
                  {organization?.name || userDisplayName}
                </p>
                <p className="text-xs text-foreground-muted truncate">
                  {userSecondary}
                </p>
              </div>
              <div className="p-2 space-y-1">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
                  onClick={() => setWorkspaceOpen(false)}
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </Link>
                <Link
                  href="/settings/billing"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
                  onClick={() => setWorkspaceOpen(false)}
                >
                  <PaymentIcon className="h-4 w-4" />
                  Billing & plan
                </Link>
                <Link
                  href="/settings/team?invite=1"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
                  onClick={() => setWorkspaceOpen(false)}
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Invite team
                </Link>
                <Link
                  href="/portal"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
                  onClick={() => setWorkspaceOpen(false)}
                >
                  <EyeIcon className="h-4 w-4" />
                  View client portal
                </Link>
                <div className="mt-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground-secondary">Appearance</span>
                  <div className="flex items-center gap-2">
                    <QuickThemeSwitcher />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground-secondary transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {notificationsOpen && (
            <div className="fixed inset-x-3 top-[72px] z-50 max-h-[70vh] overflow-y-auto rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[clamp(260px,70vw,440px)]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)]">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[var(--primary)] hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="px-4 py-8 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                    <p className="mt-2 text-xs text-foreground-muted">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <BellIcon className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
                    <p className="text-sm text-foreground-muted">No notifications yet</p>
                    <p className="text-xs text-foreground-muted mt-1">You&apos;ll see notifications here when there&apos;s activity</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--background-hover)] transition-colors",
                        notification.unread && "bg-[var(--primary)]/5"
                      )}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--background)]">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{notification.title}</p>
                          {notification.unread && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                          )}
                        </div>
                        <p className="text-xs text-foreground-muted truncate">{notification.message}</p>
                        <p className="text-xs text-foreground-muted mt-1">{notification.time}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-[var(--card-border)] px-4 py-2">
                <Link
                  href="/notifications"
                  className="block text-center text-xs text-[var(--primary)] hover:underline"
                  onClick={() => setNotificationsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <div ref={helpRef} className="relative">
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground-secondary transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <HelpIcon className="h-5 w-5" />
          </button>

          {/* Help dropdown */}
          {helpOpen && (
            <div className="fixed inset-x-3 top-[72px] z-50 rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[min(320px,calc(100vw-16px))]">
              <div className="py-1">
                <a
                  href="https://docs.example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors"
                >
                  <BookIcon className="h-4 w-4 text-foreground-muted" />
                  Documentation
                </a>
                <a
                  href="https://support.example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors"
                >
                  <LifebuoyIcon className="h-4 w-4 text-foreground-muted" />
                  Support
                </a>
                <button
                  onClick={() => {
                    setHelpOpen(false);
                    setShortcutsOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors"
                >
                  <KeyboardIcon className="h-4 w-4 text-foreground-muted" />
                  <span className="flex-1 text-left">Keyboard shortcuts</span>
                  <kbd className="rounded border border-[var(--card-border)] bg-[var(--background)] px-1.5 py-0.5 text-xs text-foreground-muted">?</kbd>
                </button>
                <div className="border-t border-[var(--card-border)] my-1" />
                <a
                  href="mailto:feedback@example.com"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors"
                >
                  <FeedbackIcon className="h-4 w-4 text-foreground-muted" />
                  Send feedback
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
      </div>

      {/* Search modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8"
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
            setSearchResults([]);
          }}
        >
          <div
            ref={searchRef}
            className="w-full max-w-2xl rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--card-border)] px-4 py-3">
              <SearchIcon className="h-5 w-5 text-foreground-muted" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search galleries, clients, invoices..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-10 flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="rounded-lg px-2 py-1 text-sm text-foreground-muted hover:bg-[var(--background-hover)]"
              >
                Esc
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--card-border)] px-4 py-2">
              {["gallery","client","payment","property","service","invoice","booking"].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type as SearchResult["type"])}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    activeTypes.includes(type as SearchResult["type"])
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--card-border)] text-foreground-muted hover:text-foreground hover:border-[var(--primary)]/40"
                  )}
                >
                  {type}
                </button>
              ))}
              <button
                onClick={() => setActiveTypes([])}
                className="ml-auto text-xs text-[var(--primary)] hover:underline"
              >
                Clear
              </button>
            </div>

            {isSearching ? (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                <p className="mt-2 text-xs text-foreground-muted">Searching...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="max-h-[60vh] overflow-y-auto">
                {filteredResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSearchSelect(result)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--background-hover)] transition-colors"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--background)] text-foreground-muted">
                      {getResultIcon(result.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" title={result.title}>
                        {result.title}
                      </p>
                      <p className="text-xs text-foreground-muted truncate" title={result.subtitle}>
                        {result.subtitle}
                      </p>
                    </div>
                    <span className="text-xs text-foreground-muted capitalize">{result.type}</span>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() !== "" ? (
              <div className="px-4 py-8 text-center">
                <SearchIcon className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
                <p className="text-sm text-foreground-muted">No results found for &quot;{searchQuery}&quot;</p>
              </div>
            ) : recentResults.length > 0 ? (
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="px-4 py-3 text-xs uppercase tracking-wide text-foreground-muted">Recent</div>
                {recentResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSearchSelect(result)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--background-hover)] transition-colors"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--background)] text-foreground-muted">
                      {getResultIcon(result.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" title={result.title}>
                        {result.title}
                      </p>
                      <p className="text-xs text-foreground-muted truncate" title={result.subtitle}>
                        {result.subtitle}
                      </p>
                    </div>
                    <span className="text-xs text-foreground-muted capitalize">{result.type}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-foreground-muted">
                Start typing to search across the workspace.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z" clipRule="evenodd" />
    </svg>
  );
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM1.75 14.5a.75.75 0 0 0 0 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 0 0-1.5 0v.784a.272.272 0 0 1-.35.25A49.043 49.043 0 0 0 1.75 14.5Z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 16.82A7.462 7.462 0 0 1 15 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0 0 18 15.06V4.94a.75.75 0 0 0-.546-.722 9.006 9.006 0 0 0-4.08-.286c-1.53.235-2.944.754-4.119 1.454a9.006 9.006 0 0 0-4.119-1.454A9.006 9.006 0 0 0 1.046 4.18a.75.75 0 0 0-.546.722v10.12a.75.75 0 0 0 .954.721A7.506 7.506 0 0 1 5 15.5a7.462 7.462 0 0 1 4.25 1.32.75.75 0 0 0 1.5 0Z" />
    </svg>
  );
}

function LifebuoyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.171 4.146l1.947 2.466a3.514 3.514 0 0 1 1.764 0l1.947-2.466a6.52 6.52 0 0 0-5.658 0Zm8.683 3.025l-2.466 1.947c.15.578.15 1.186 0 1.764l2.466 1.947a6.52 6.52 0 0 0 0-5.658Zm-3.025 8.683l-1.947-2.466c-.578.15-1.186.15-1.764 0l-1.947 2.466a6.52 6.52 0 0 0 5.658 0ZM4.146 12.829l2.466-1.947a3.514 3.514 0 0 1 0-1.764L4.146 7.171a6.52 6.52 0 0 0 0 5.658ZM10 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 2a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" clipRule="evenodd" />
    </svg>
  );
}

function KeyboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Z" clipRule="evenodd" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function FeedbackIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}

function ContractIcon({ className }: { className?: string }) {
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

function PropertyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
    </svg>
  );
}

function ServiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z" clipRule="evenodd" />
    </svg>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.988 3.012A2.25 2.25 0 0 1 18 5.25v6.5A2.25 2.25 0 0 1 15.75 14H13.5V7A2.5 2.5 0 0 0 11 4.5H8.128a2.252 2.252 0 0 1 1.884-1.488A2.25 2.25 0 0 1 12.25 1h1.5a2.25 2.25 0 0 1 2.238 2.012ZM11.5 3.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v.25h-3v-.25Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M2 7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7Zm2 3.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.046 15.253c-.058.468.172.92.57 1.175A9.953 9.953 0 0 0 8 18c1.982 0 3.83-.578 5.384-1.573.398-.254.628-.707.57-1.175a6.001 6.001 0 0 0-11.908 0ZM16.75 5.75a.75.75 0 0 0-1.5 0v2h-2a.75.75 0 0 0 0 1.5h2v2a.75.75 0 0 0 1.5 0v-2h2a.75.75 0 0 0 0-1.5h-2v-2Z" />
    </svg>
  );
}
