"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchResult } from "@/lib/actions/search";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavigationItem {
  id: string;
  title: string;
  href: string;
  keywords: string[];
  icon: React.ReactNode;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "dashboard", title: "Dashboard", href: "/dashboard", keywords: ["home", "overview"], icon: <DashboardIcon /> },
  { id: "galleries", title: "Galleries", href: "/galleries", keywords: ["photos", "projects"], icon: <GalleryIcon /> },
  { id: "galleries-new", title: "New Gallery", href: "/galleries/new", keywords: ["create gallery", "add gallery"], icon: <PlusIcon /> },
  { id: "clients", title: "Clients", href: "/clients", keywords: ["customers", "contacts"], icon: <ClientIcon /> },
  { id: "clients-new", title: "New Client", href: "/clients/new", keywords: ["create client", "add client"], icon: <PlusIcon /> },
  { id: "invoices", title: "Invoices", href: "/invoices", keywords: ["billing", "payments"], icon: <InvoiceIcon /> },
  { id: "invoices-new", title: "New Invoice", href: "/invoices/new", keywords: ["create invoice", "add invoice"], icon: <PlusIcon /> },
  { id: "scheduling", title: "Scheduling", href: "/scheduling", keywords: ["calendar", "bookings"], icon: <CalendarIcon /> },
  { id: "scheduling-new", title: "New Booking", href: "/scheduling/new", keywords: ["create booking", "schedule"], icon: <PlusIcon /> },
  { id: "properties", title: "Properties", href: "/properties", keywords: ["real estate", "websites"], icon: <PropertyIcon /> },
  { id: "services", title: "Services", href: "/services", keywords: ["packages", "pricing"], icon: <ServiceIcon /> },
  { id: "contracts", title: "Contracts", href: "/contracts", keywords: ["agreements", "documents"], icon: <ContractIcon /> },
  { id: "payments", title: "Payments", href: "/payments", keywords: ["transactions", "money"], icon: <PaymentIcon /> },
  { id: "projects", title: "Projects", href: "/projects", keywords: ["board", "tasks"], icon: <ProjectIcon /> },
  { id: "settings", title: "Settings", href: "/settings", keywords: ["preferences", "account"], icon: <SettingsIcon /> },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Perform search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const results = await globalSearch(debouncedQuery);
        const allResults = [
          ...results.clients,
          ...results.galleries,
          ...results.properties,
          ...results.services,
          ...results.invoices,
          ...results.bookings,
        ];
        setSearchResults(allResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // Filter navigation items by query
  const filteredNavItems = query.trim()
    ? NAVIGATION_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords.some((k) => k.includes(query.toLowerCase()))
      )
    : NAVIGATION_ITEMS.slice(0, 6);

  // Combined results
  const allItems = [
    ...searchResults.map((r) => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      href: r.href,
      type: r.type,
      isNavigation: false,
    })),
    ...filteredNavItems.map((n) => ({
      id: n.id,
      title: n.title,
      subtitle: undefined,
      href: n.href,
      type: "navigation" as const,
      isNavigation: true,
      icon: n.icon,
    })),
  ];

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
      setSearchResults([]);
    }
  }, [open]);

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href);
      onOpenChange(false);
    },
    [router, onOpenChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i < allItems.length - 1 ? i + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i > 0 ? i - 1 : allItems.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (allItems[selectedIndex]) {
            handleSelect(allItems[selectedIndex].href);
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [allItems, selectedIndex, handleSelect, onOpenChange]
  );

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const selectedElement = list.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="absolute left-1/2 top-[20%] w-full max-w-xl -translate-x-1/2 px-4">
        <div className="overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-[var(--card-border)] px-4 py-3">
            <SearchIcon className="h-5 w-5 text-foreground-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or type a command..."
              className="flex-1 bg-transparent text-foreground placeholder:text-foreground-muted focus:outline-none"
            />
            {isSearching && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-[var(--card-border)] bg-[var(--background-secondary)] px-1.5 py-0.5 text-xs text-foreground-muted">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            className="max-h-[400px] overflow-y-auto p-2"
          >
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1.5 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Search Results
                </p>
                {searchResults.map((result, index) => (
                  <button
                    key={`search-${result.id}`}
                    data-index={index}
                    onClick={() => handleSelect(result.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      selectedIndex === index
                        ? "bg-[var(--primary)] text-white"
                        : "text-foreground hover:bg-[var(--background-hover)]"
                    )}
                  >
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shrink-0",
                      selectedIndex === index
                        ? "bg-white/20"
                        : "bg-[var(--background-secondary)]"
                    )}>
                      {getTypeIcon(result.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className={cn(
                          "text-xs truncate",
                          selectedIndex === index ? "text-white/70" : "text-foreground-muted"
                        )}>
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full capitalize shrink-0",
                      selectedIndex === index
                        ? "bg-white/20 text-white"
                        : "bg-[var(--background-secondary)] text-foreground-muted"
                    )}>
                      {result.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Navigation Items */}
            {filteredNavItems.length > 0 && (
              <div>
                <p className="px-2 py-1.5 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  {query.trim() ? "Go to" : "Quick Access"}
                </p>
                {filteredNavItems.map((item, index) => {
                  const actualIndex = searchResults.length + index;
                  return (
                    <button
                      key={`nav-${item.id}`}
                      data-index={actualIndex}
                      onClick={() => handleSelect(item.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        selectedIndex === actualIndex
                          ? "bg-[var(--primary)] text-white"
                          : "text-foreground hover:bg-[var(--background-hover)]"
                      )}
                    >
                      <span className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shrink-0",
                        selectedIndex === actualIndex
                          ? "bg-white/20"
                          : "bg-[var(--background-secondary)]"
                      )}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {allItems.length === 0 && query.trim() && !isSearching && (
              <div className="py-8 text-center">
                <p className="text-foreground-muted">No results found for &quot;{query}&quot;</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--card-border)] px-4 py-2">
            <div className="flex items-center gap-4 text-xs text-foreground-muted">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-[var(--card-border)] bg-[var(--background-secondary)] px-1">↑</kbd>
                <kbd className="rounded border border-[var(--card-border)] bg-[var(--background-secondary)] px-1">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-[var(--card-border)] bg-[var(--background-secondary)] px-1">↵</kbd>
                to select
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTypeIcon(type: string) {
  switch (type) {
    case "client":
      return <ClientIcon />;
    case "gallery":
      return <GalleryIcon />;
    case "property":
      return <PropertyIcon />;
    case "service":
      return <ServiceIcon />;
    case "invoice":
      return <InvoiceIcon />;
    case "booking":
      return <CalendarIcon />;
    default:
      return <SearchIcon className="h-4 w-4" />;
  }
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "h-4 w-4"}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M2.5 3A1.5 1.5 0 0 0 1 4.5v4A1.5 1.5 0 0 0 2.5 10h6A1.5 1.5 0 0 0 10 8.5v-4A1.5 1.5 0 0 0 8.5 3h-6Zm11 2A1.5 1.5 0 0 0 12 6.5v7a1.5 1.5 0 0 0 1.5 1.5h4a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 17.5 5h-4Zm-10 7A1.5 1.5 0 0 0 2 13.5v2A1.5 1.5 0 0 0 3.5 17h6a1.5 1.5 0 0 0 1.5-1.5v-2A1.5 1.5 0 0 0 9.5 12h-6Z" clipRule="evenodd" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ClientIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function PropertyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
    </svg>
  );
}

function ServiceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z" clipRule="evenodd" />
    </svg>
  );
}

function ContractIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 1a.75.75 0 0 1 .75.75v1.5h3.5a.75.75 0 0 1 .53 1.28l-2.22 2.22H16a.75.75 0 0 1 0 1.5h-4.19l2.22 2.22a.75.75 0 1 1-1.06 1.06L10.75 9.31V15a.75.75 0 0 1-1.5 0V9.31l-2.22 2.22a.75.75 0 0 1-1.06-1.06l2.22-2.22H4a.75.75 0 0 1 0-1.5h3.44l-2.22-2.22a.75.75 0 0 1 1.06-1.06l2.22 2.22V1.75A.75.75 0 0 1 10 1Z" />
      <path d="M5.75 12a.75.75 0 0 0-.75.75v2.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-1.5 0v1.75h-7v-1.75a.75.75 0 0 0-.75-.75Z" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ProjectIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 15.25a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 10a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1V10Z" clipRule="evenodd" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.262.125l.962.962a1 1 0 0 1 .125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 0 1 .804.98v1.361a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.125 1.262l-.962.962a1 1 0 0 1-1.262.125l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.294 1.473a1 1 0 0 1-.98.804H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.262-.125l-.962-.962a1 1 0 0 1-.125-1.262l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.294A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .125-1.262l.962-.962A1 1 0 0 1 5.38 3.03l1.25.834a6.957 6.957 0 0 1 1.416-.587l.294-1.473ZM13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}
