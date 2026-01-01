"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { KeyboardShortcutsModal } from "@/components/ui/keyboard-shortcuts-modal";

interface DashboardTopbarProps {
  className?: string;
}

// Demo notifications data
const demoNotifications = [
  { id: "n1", type: "payment", title: "Payment received", message: "Sarah M. paid $450 for Luxury Property Package", time: "2 hours ago", unread: true },
  { id: "n2", type: "view", title: "Gallery viewed", message: "Downtown Condo gallery was viewed by client", time: "4 hours ago", unread: true },
  { id: "n3", type: "download", title: "Photos downloaded", message: "Client downloaded 5 photos from Sunset Estate", time: "Yesterday", unread: false },
  { id: "n4", type: "comment", title: "New comment", message: "Client commented on photo in Modern Apartment gallery", time: "Yesterday", unread: false },
  { id: "n5", type: "expiring", title: "Gallery expiring soon", message: "Beachfront Villa gallery expires in 3 days", time: "2 days ago", unread: false },
];

// Demo search results
interface SearchResult {
  id: string;
  type: "gallery" | "client" | "payment";
  title: string;
  subtitle: string;
  url: string;
}

const demoSearchData: SearchResult[] = [
  { id: "g1", type: "gallery", title: "Luxury Property Package", subtitle: "Sarah M. • Delivered", url: "/galleries/1" },
  { id: "g2", type: "gallery", title: "Downtown Condo", subtitle: "John D. • Pending", url: "/galleries/2" },
  { id: "g3", type: "gallery", title: "Modern Apartment", subtitle: "Emily R. • Draft", url: "/galleries/3" },
  { id: "c1", type: "client", title: "Sarah Mitchell", subtitle: "sarah@example.com", url: "/clients/1" },
  { id: "c2", type: "client", title: "John Davis", subtitle: "john@example.com", url: "/clients/2" },
  { id: "p1", type: "payment", title: "$450 Payment", subtitle: "Sarah M. • Dec 18, 2024", url: "/payments" },
  { id: "p2", type: "payment", title: "$350 Payment", subtitle: "Emily R. • Dec 15, 2024", url: "/payments" },
];

export function DashboardTopbar({ className }: DashboardTopbarProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(demoNotifications);
  const [helpOpen, setHelpOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    const filtered = demoSearchData.filter(
      item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  }, []);

  const handleSearchSelect = (result: SearchResult) => {
    router.push(result.url);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
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

      // Open keyboard shortcuts modal with "?"
      if (e.key === "?" && !isTyping) {
        e.preventDefault();
        setShortcutsOpen(true);
      }

      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setHelpOpen(false);
        setShortcutsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment": return <PaymentIcon className="h-4 w-4 text-[var(--success)]" />;
      case "view": return <EyeIcon className="h-4 w-4 text-[var(--primary)]" />;
      case "download": return <DownloadIcon className="h-4 w-4 text-[var(--primary)]" />;
      case "comment": return <CommentIcon className="h-4 w-4 text-[var(--warning)]" />;
      case "expiring": return <ClockIcon className="h-4 w-4 text-[var(--error)]" />;
      default: return <BellIcon className="h-4 w-4" />;
    }
  };

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "gallery": return <GalleryIcon className="h-4 w-4" />;
      case "client": return <UserIcon className="h-4 w-4" />;
      case "payment": return <PaymentIcon className="h-4 w-4" />;
    }
  };

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b border-[var(--card-border)] bg-[var(--card)] px-6",
        className
      )}
    >
      {/* Left side - Search */}
      <div className="flex flex-1 items-center gap-4">
        <div ref={searchRef} className="relative max-w-md flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted pointer-events-none z-10" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search galleries, clients, payments..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-10 pr-16 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
          />
          <kbd
            onClick={() => {
              setSearchOpen(true);
              searchInputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-[var(--card-border)] bg-[var(--background-secondary)] px-1.5 py-0.5 text-xs text-foreground-muted lg:inline-flex cursor-pointer hover:bg-[var(--background-hover)]"
          >
            ⌘K
          </kbd>

          {/* Search results dropdown */}
          {searchOpen && (searchQuery.trim() !== "" || searchResults.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-xl z-50 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchSelect(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--background-hover)] transition-colors"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--background)] text-foreground-muted">
                        {getResultIcon(result.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                        <p className="text-xs text-foreground-muted truncate">{result.subtitle}</p>
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
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Quick create button */}
        <Link
          href="/galleries/new"
          className="flex h-9 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition-all hover:bg-[var(--primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">New Gallery</span>
        </Link>

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
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-xl z-50 overflow-hidden">
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
                {notifications.map((notification) => (
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
                ))}
              </div>
              <div className="border-t border-[var(--card-border)] px-4 py-2">
                <Link
                  href="/settings/notifications"
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
            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-xl z-50 overflow-hidden">
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
    </header>
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

function FeedbackIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}
