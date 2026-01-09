"use client";

import { useState, useRef, useEffect } from "react";
import type { PortalTab } from "./types";

interface MobileNavProps {
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  pendingQuestionnaires: number;
  unpaidInvoices: number;
  newLeads?: number;
  unreadMessages?: number;
}

export function MobileNav({
  activeTab,
  onTabChange,
  pendingQuestionnaires,
  unpaidInvoices,
  newLeads = 0,
  unreadMessages = 0,
}: MobileNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  // Primary tabs (always visible) - most frequently used
  const primaryTabs: { id: PortalTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "properties",
      label: "Properties",
      icon: <HomeIcon />,
    },
    {
      id: "galleries",
      label: "Galleries",
      icon: <ImageIcon />,
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: <ReceiptIcon />,
      badge: unpaidInvoices > 0 ? unpaidInvoices : undefined,
    },
    {
      id: "questionnaires",
      label: "Forms",
      icon: <ClipboardIcon />,
      badge: pendingQuestionnaires > 0 ? pendingQuestionnaires : undefined,
    },
  ];

  // Secondary tabs (scrollable)
  const secondaryTabs: { id: PortalTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "downloads",
      label: "Downloads",
      icon: <DownloadIcon />,
    },
    {
      id: "leads",
      label: "Leads",
      icon: <InboxIcon />,
      badge: newLeads > 0 ? newLeads : undefined,
    },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageIcon />,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <SettingsIcon />,
    },
  ];

  const allTabs = [...primaryTabs, ...secondaryTabs];

  // Calculate total badge count for attention indicator
  const totalBadges = pendingQuestionnaires + unpaidInvoices + newLeads + unreadMessages;

  // Handle scroll to update gradient visibility
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftGradient(scrollLeft > 5);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  // Scroll active tab into view
  useEffect(() => {
    if (scrollRef.current) {
      const activeIndex = allTabs.findIndex((tab) => tab.id === activeTab);
      if (activeIndex > 3) {
        // Only scroll for secondary tabs
        const scrollAmount = (activeIndex - 3) * 80; // Approximate tab width
        scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
      } else if (activeIndex <= 3) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    }
  }, [activeTab, allTabs]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--card-border)] bg-[var(--card)] pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile navigation"
    >
      {/* Attention banner for pending items */}
      {totalBadges > 0 && activeTab === "properties" && (
        <div className="flex items-start justify-between gap-4 flex-wrap bg-[var(--warning)]/10 px-4 py-2 text-xs">
          <span className="text-[var(--warning)]">
            You have {totalBadges} item{totalBadges !== 1 ? "s" : ""} needing attention
          </span>
          <button
            onClick={() => {
              // Navigate to the most urgent tab
              if (pendingQuestionnaires > 0) onTabChange("questionnaires");
              else if (unpaidInvoices > 0) onTabChange("invoices");
              else if (unreadMessages > 0) onTabChange("messages");
              else if (newLeads > 0) onTabChange("leads");
            }}
            className="font-medium text-[var(--warning)] hover:underline"
          >
            View
          </button>
        </div>
      )}

      <div className="relative">
        {/* Left gradient overlay */}
        {showLeftGradient && (
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-[var(--card)] to-transparent" />
        )}

        {/* Right gradient overlay */}
        {showRightGradient && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-[var(--card)] to-transparent" />
        )}

        {/* Scrollable tabs */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-16 overflow-x-auto scrollbar-hide"
          role="tablist"
        >
          {allTabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const badgeLabel =
              tab.badge !== undefined && tab.badge > 0
                ? ` (${tab.badge} pending)`
                : "";
            const isPrimary = index < 4;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
                aria-label={`${tab.label}${badgeLabel}`}
                tabIndex={isActive ? 0 : -1}
                className={`relative flex min-w-[72px] flex-shrink-0 flex-col items-center justify-center gap-1 px-3 transition-all active:scale-95 ${
                  isPrimary ? "flex-1" : ""
                } ${
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground-secondary)]"
                }`}
              >
                <div className={`relative rounded-xl p-1.5 transition-colors ${
                  isActive ? "bg-[var(--primary)]/10" : ""
                }`} aria-hidden="true">
                  {tab.icon}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--error)] px-1 text-[10px] font-bold text-white animate-pulse">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-[var(--primary)]" : ""
                }`}>{tab.label}</span>
                {isActive && (
                  <span
                    className="absolute left-1/2 top-0 h-0.5 w-10 -translate-x-1/2 rounded-full bg-[var(--primary)]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// Icons (sized for mobile nav - h-5 w-5)
function HomeIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
      />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z"
      />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}
