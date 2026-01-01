"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PhotoProOSLogo } from "@/components/ui/photoproos-logo";

/**
 * Navbar Component
 *
 * Main navigation bar with dropdown menus and mobile support.
 * Uses semantic design tokens for consistent theming.
 */

interface NavbarProps {
  className?: string;
}

interface DropdownItem {
  title: string;
  description: string;
  href: string;
  badge?: string;
  icon?: React.ReactNode;
}

const featuresItems: DropdownItem[] = [
  {
    title: "Client Galleries",
    description: "Beautiful, branded galleries with pay-to-unlock photo delivery.",
    href: "#features",
    icon: <GalleryIcon className="h-4 w-4" />,
  },
  {
    title: "Payment Processing",
    description: "Accept payments, collect deposits, and automate invoicing.",
    href: "#features",
    icon: <PaymentIcon className="h-4 w-4" />,
  },
  {
    title: "Client Management",
    description: "Track leads, manage bookings, and nurture relationships.",
    href: "#features",
    icon: <ClientIcon className="h-4 w-4" />,
  },
  {
    title: "Workflow Automation",
    description: "Automate emails, contracts, and follow-ups.",
    href: "#features",
    icon: <AutomationIcon className="h-4 w-4" />,
  },
  {
    title: "Analytics & Reports",
    description: "Track revenue, client insights, and business metrics.",
    href: "#features",
    icon: <AnalyticsIcon className="h-4 w-4" />,
  },
  {
    title: "Contracts & E-Sign",
    description: "Send and sign contracts digitally.",
    href: "#roadmap",
    badge: "SOON",
    icon: <ContractIcon className="h-4 w-4" />,
  },
];

const industriesItems: DropdownItem[] = [
  {
    title: "Real Estate",
    description: "Listings, virtual tours, and agent delivery workflows.",
    href: "#use-cases",
  },
  {
    title: "Commercial",
    description: "Brand photography, product shots, and corporate imaging.",
    href: "#use-cases",
  },
  {
    title: "Architecture & Interiors",
    description: "High-end property and design portfolio delivery.",
    href: "#use-cases",
  },
  {
    title: "Events & Corporate",
    description: "Conferences, galas, and corporate event coverage.",
    href: "#use-cases",
  },
  {
    title: "Headshots & Portraits",
    description: "Professional portraits and team photography.",
    href: "#use-cases",
  },
  {
    title: "Food & Hospitality",
    description: "Restaurant, hotel, and culinary photography.",
    href: "#use-cases",
  },
];

const resourceItems: DropdownItem[] = [
  {
    title: "Help Center",
    description: "Get help with using PhotoProOS.",
    href: "/help",
  },
  {
    title: "Blog",
    description: "Tips, guides, and industry insights.",
    href: "/blog",
  },
  {
    title: "Changelog",
    description: "See what's new in PhotoProOS.",
    href: "/changelog",
  },
  {
    title: "Roadmap",
    description: "What's coming next.",
    href: "#roadmap",
  },
];

export function Navbar({ className }: NavbarProps) {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Handle scroll for navbar blur effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Reset focused index when dropdown closes
  React.useEffect(() => {
    if (!activeDropdown) {
      setFocusedIndex(-1);
    }
  }, [activeDropdown]);

  // Get current dropdown items
  const getCurrentItems = () => {
    if (activeDropdown === "features") return featuresItems;
    if (activeDropdown === "industries") return industriesItems;
    if (activeDropdown === "resources") return resourceItems;
    return [];
  };

  // Keyboard navigation for dropdowns
  const handleDropdownKeyDown = (e: React.KeyboardEvent, dropdownName: string) => {
    const items = getCurrentItems();

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (activeDropdown === dropdownName) {
          setActiveDropdown(null);
        } else {
          setActiveDropdown(dropdownName);
          setFocusedIndex(0);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (activeDropdown === dropdownName) {
          setFocusedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        } else {
          setActiveDropdown(dropdownName);
          setFocusedIndex(0);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (activeDropdown === dropdownName) {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        }
        break;
      case "Escape":
        e.preventDefault();
        setActiveDropdown(null);
        setFocusedIndex(-1);
        break;
      case "Tab":
        setActiveDropdown(null);
        setFocusedIndex(-1);
        break;
    }
  };

  // Handle item keyboard navigation
  const handleItemKeyDown = (e: React.KeyboardEvent, href: string) => {
    const items = getCurrentItems();

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        window.location.href = href;
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case "Escape":
        e.preventDefault();
        setActiveDropdown(null);
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <nav
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex h-[88px] items-center justify-between px-6 transition-all duration-300",
        isScrolled && "nav-scrolled",
        className
      )}
    >
      {/* Logo */}
      <div className="mr-2">
        <Link
          href="/"
          className="flex items-center"
          aria-label="PhotoProOS home"
        >
          <PhotoProOSLogo size="sm" />
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="hidden flex-1 justify-center gap-1 lg:flex">
        {/* Features Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setActiveDropdown("features")}
          onMouseLeave={() => setActiveDropdown(null)}
          ref={activeDropdown === "features" ? dropdownRef : null}
        >
          <button
            className="flex items-center gap-1 rounded-[var(--button-radius)] px-4 py-[10px] text-sm font-medium text-foreground transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-expanded={activeDropdown === "features"}
            aria-haspopup="true"
            onKeyDown={(e) => handleDropdownKeyDown(e, "features")}
          >
            Features
            <ChevronDownIcon className={cn("h-4 w-4 transition-transform duration-[var(--duration-fast)]", activeDropdown === "features" && "rotate-180")} />
          </button>

          {activeDropdown === "features" && (
            <div className="absolute left-1/2 top-full pt-2 -translate-x-1/2 animate-fade-in" role="menu" aria-orientation="vertical">
              <div className="w-[540px] rounded-xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-4 shadow-2xl">
                <p className="mb-3 px-2 font-mono text-xs uppercase tracking-wider text-foreground-muted">
                  Platform Features
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {featuresItems.map((item, index) => (
                    <DropdownLink
                      key={item.href + item.title}
                      {...item}
                      isFocused={focusedIndex === index}
                      onKeyDown={(e) => handleItemKeyDown(e, item.href)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Industries Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setActiveDropdown("industries")}
          onMouseLeave={() => setActiveDropdown(null)}
          ref={activeDropdown === "industries" ? dropdownRef : null}
        >
          <button
            className="flex items-center gap-1 rounded-[var(--button-radius)] px-4 py-[10px] text-sm font-medium text-foreground transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-expanded={activeDropdown === "industries"}
            aria-haspopup="true"
            onKeyDown={(e) => handleDropdownKeyDown(e, "industries")}
          >
            Industries
            <ChevronDownIcon className={cn("h-4 w-4 transition-transform duration-[var(--duration-fast)]", activeDropdown === "industries" && "rotate-180")} />
          </button>

          {activeDropdown === "industries" && (
            <div className="absolute left-1/2 top-full pt-2 -translate-x-1/2 animate-fade-in" role="menu" aria-orientation="vertical">
              <div className="w-[540px] rounded-xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-4 shadow-2xl">
                <p className="mb-3 px-2 font-mono text-xs uppercase tracking-wider text-foreground-muted">
                  Photography Verticals
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {industriesItems.map((item, index) => (
                    <DropdownLink
                      key={item.href + item.title}
                      {...item}
                      isFocused={focusedIndex === index}
                      onKeyDown={(e) => handleItemKeyDown(e, item.href)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resources Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setActiveDropdown("resources")}
          onMouseLeave={() => setActiveDropdown(null)}
          ref={activeDropdown === "resources" ? dropdownRef : null}
        >
          <button
            className="flex items-center gap-1 rounded-[var(--button-radius)] px-4 py-[10px] text-sm font-medium text-foreground transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-expanded={activeDropdown === "resources"}
            aria-haspopup="true"
            onKeyDown={(e) => handleDropdownKeyDown(e, "resources")}
          >
            Resources
            <ChevronDownIcon className={cn("h-4 w-4 transition-transform duration-[var(--duration-fast)]", activeDropdown === "resources" && "rotate-180")} />
          </button>

          {activeDropdown === "resources" && (
            <div className="absolute left-1/2 top-full pt-2 -translate-x-1/2 animate-fade-in" role="menu" aria-orientation="vertical">
              <div className="w-[320px] rounded-xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-4 shadow-2xl">
                <div className="grid gap-1">
                  {resourceItems.map((item, index) => (
                    <DropdownLink
                      key={item.href + item.title}
                      {...item}
                      isFocused={focusedIndex === index}
                      onKeyDown={(e) => handleItemKeyDown(e, item.href)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <NavLink href="#pricing">Pricing</NavLink>
      </div>

      {/* Right Side Actions */}
      <div className="hidden gap-2 lg:flex">
        <Button variant="secondary" asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button variant="default" asChild>
          <Link href="/signup">Start free trial</Link>
        </Button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="flex min-h-[var(--touch-target-min)] min-w-[var(--touch-target-min)] items-center justify-center rounded-[var(--button-radius)] bg-[var(--background-elevated)] p-[10px] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-hover)] lg:hidden"
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
      >
        {isMobileMenuOpen ? (
          <CloseIcon className="h-5 w-5" aria-hidden="true" />
        ) : (
          <MenuIcon className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 top-[88px] z-40 bg-background/95 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div
            className="flex h-full flex-col overflow-y-auto bg-background px-6 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Features Section */}
            <div className="border-b border-[var(--border)] py-4">
              <p className="mb-3 font-mono text-xs uppercase tracking-wider text-foreground-muted">
                Features
              </p>
              <div className="space-y-1">
                {featuresItems.map((item) => (
                  <Link
                    key={item.href + item.title}
                    href={item.href}
                    className="flex items-center justify-between rounded-[var(--button-radius)] p-3 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        {item.badge && (
                          <span className="rounded-[var(--badge-radius)] bg-[var(--primary)]/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--primary)]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="mt-1 block text-xs text-foreground-muted">{item.description}</span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-[var(--border-visible)]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Industries Section */}
            <div className="border-b border-[var(--border)] py-4">
              <p className="mb-3 font-mono text-xs uppercase tracking-wider text-foreground-muted">
                Industries
              </p>
              <div className="space-y-1">
                {industriesItems.map((item) => (
                  <Link
                    key={item.href + item.title}
                    href={item.href}
                    className="flex items-center justify-between rounded-[var(--button-radius)] p-3 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    <ChevronRightIcon className="h-4 w-4 text-[var(--border-visible)]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources Section */}
            <div className="border-b border-[var(--border)] py-4">
              <p className="mb-3 font-mono text-xs uppercase tracking-wider text-foreground-muted">
                Resources
              </p>
              <div className="space-y-1">
                {resourceItems.map((item) => (
                  <Link
                    key={item.href + item.title}
                    href={item.href}
                    className="flex items-center justify-between rounded-[var(--button-radius)] p-3 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    <ChevronRightIcon className="h-4 w-4 text-[var(--border-visible)]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Pricing Link */}
            <div className="border-b border-[var(--border)] py-4">
              <Link
                href="#pricing"
                className="flex items-center justify-between rounded-[var(--button-radius)] p-3 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-sm font-medium text-foreground">Pricing</span>
                <ChevronRightIcon className="h-4 w-4 text-[var(--border-visible)]" aria-hidden="true" />
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="mt-auto space-y-3 pt-6">
              <Button variant="default" size="lg" className="w-full" asChild>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  Start free trial
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Log in
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

interface DropdownLinkProps extends DropdownItem {
  isFocused?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

function DropdownLink({ title, description, href, badge, icon, isFocused, onKeyDown }: DropdownLinkProps) {
  const linkRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    if (isFocused && linkRef.current) {
      linkRef.current.focus();
    }
  }, [isFocused]);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={cn(
        "group flex items-start gap-3 rounded-[var(--button-radius)] p-3",
        "transition-colors duration-[var(--duration-fast)]",
        "hover:bg-[var(--background-elevated)] focus:bg-[var(--background-elevated)] focus:outline-none",
        isFocused && "bg-[var(--background-elevated)] ring-1 ring-foreground/20"
      )}
      role="menuitem"
      tabIndex={isFocused ? 0 : -1}
      onKeyDown={onKeyDown}
    >
      {icon && (
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {badge && (
            <span className="rounded-[var(--badge-radius)] bg-[var(--primary)]/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--primary)]">
              {badge}
            </span>
          )}
        </div>
        <span className="text-xs text-foreground-muted">{description}</span>
      </div>
    </Link>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-[var(--button-radius)] px-4 py-[10px] text-sm font-medium text-foreground transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)]"
    >
      {children}
    </Link>
  );
}

// Icons
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

// Feature Icons
function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ClientIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function AutomationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
    </svg>
  );
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function ContractIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}
