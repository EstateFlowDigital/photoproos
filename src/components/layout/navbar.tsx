"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
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
    icon: <RealEstateIcon className="h-4 w-4" />,
  },
  {
    title: "Commercial",
    description: "Brand photography, product shots, and corporate imaging.",
    href: "#use-cases",
    icon: <CommercialIcon className="h-4 w-4" />,
  },
  {
    title: "Architecture & Interiors",
    description: "High-end property and design portfolio delivery.",
    href: "#use-cases",
    icon: <ArchitectureIcon className="h-4 w-4" />,
  },
  {
    title: "Events & Corporate",
    description: "Conferences, galas, and corporate event coverage.",
    href: "#use-cases",
    icon: <EventsIcon className="h-4 w-4" />,
  },
  {
    title: "Headshots & Portraits",
    description: "Professional portraits and team photography.",
    href: "#use-cases",
    icon: <PortraitIcon className="h-4 w-4" />,
  },
  {
    title: "Food & Hospitality",
    description: "Restaurant, hotel, and culinary photography.",
    href: "#use-cases",
    icon: <FoodIcon className="h-4 w-4" />,
  },
];

const resourceItems: DropdownItem[] = [
  {
    title: "Help Center",
    description: "Get help with using PhotoProOS.",
    href: "/help",
    icon: <HelpIcon className="h-4 w-4" />,
  },
  {
    title: "Blog",
    description: "Tips, guides, and industry insights.",
    href: "/blog",
    icon: <BlogIcon className="h-4 w-4" />,
  },
  {
    title: "Changelog",
    description: "See what's new in PhotoProOS.",
    href: "/changelog",
    icon: <ChangelogIcon className="h-4 w-4" />,
  },
  {
    title: "Roadmap",
    description: "What's coming next.",
    href: "#roadmap",
    icon: <RoadmapIcon className="h-4 w-4" />,
  },
];

export function Navbar({ className }: NavbarProps) {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const homeHref = isLoaded && isSignedIn ? "/dashboard" : "/";
  const isHomePage = pathname === "/";

  const resolveHref = React.useCallback(
    (href: string) => {
      if (href.startsWith("#")) {
        return isHomePage ? href : `/${href}`;
      }
      return href;
    },
    [isHomePage]
  );

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
        window.location.href = resolveHref(href);
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
          href={homeHref}
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
                      href={resolveHref(item.href)}
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
                      href={resolveHref(item.href)}
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
                      href={resolveHref(item.href)}
                      isFocused={focusedIndex === index}
                      onKeyDown={(e) => handleItemKeyDown(e, item.href)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <NavLink href={resolveHref("#pricing")}>Pricing</NavLink>
      </div>

      {/* Right Side Actions */}
      <div className="hidden gap-2 lg:flex">
        <Button variant="secondary" asChild>
          <Link href="/dashboard">Log in</Link>
        </Button>
        <Button variant="default" asChild>
          <Link href="/dashboard">Start free trial</Link>
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
                    href={resolveHref(item.href)}
                    className="flex items-start justify-between gap-4 flex-wrap rounded-[var(--button-radius)] p-3 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                          {item.icon}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{item.title}</span>
                          {item.badge && (
                            <span className="rounded-[var(--badge-radius)] bg-[var(--primary)]/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--primary)]">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="mt-0.5 block text-xs text-foreground-muted">{item.description}</span>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-[var(--border-visible)]" aria-hidden="true" />
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
                    href={resolveHref(item.href)}
                    className="flex items-start justify-between gap-4 flex-wrap rounded-[var(--button-radius)] p-3 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                          {item.icon}
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-foreground-muted">{item.description}</span>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-[var(--border-visible)]" aria-hidden="true" />
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
                    href={resolveHref(item.href)}
                    className="flex items-start justify-between gap-4 flex-wrap rounded-[var(--button-radius)] p-3 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                          {item.icon}
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-foreground-muted">{item.description}</span>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-[var(--border-visible)]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Pricing Link */}
            <div className="border-b border-[var(--border)] py-4">
              <Link
                href={resolveHref("#pricing")}
                className="flex items-start justify-between gap-4 flex-wrap rounded-[var(--button-radius)] p-3 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--background-elevated)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-sm font-medium text-foreground">Pricing</span>
                <ChevronRightIcon className="h-4 w-4 text-[var(--border-visible)]" aria-hidden="true" />
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="mt-auto space-y-3 pt-6">
              <Button variant="default" size="lg" className="w-full" asChild>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  Start free trial
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
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

// Industry Icons
function RealEstateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
    </svg>
  );
}

function CommercialIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z" clipRule="evenodd" />
      <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 0 1-9.274 0C3.985 17.585 3 16.402 3 15.055Z" />
    </svg>
  );
}

function ArchitectureIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M4 16.5v-13h-.25a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 0 1.5H16v13h.25a.75.75 0 0 1 0 1.5h-12.5a.75.75 0 0 1 0-1.5H4Zm3-11a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-2 5a1 1 0 0 1 1-1h.01a1 1 0 0 1 1 1v2h-2.01v-2Z" clipRule="evenodd" />
    </svg>
  );
}

function EventsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10ZM10 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12ZM12 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" />
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function PortraitIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function FoodIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 3c-1.095 0-2.142.19-3.115.538a6.997 6.997 0 0 0-.768 8.015A6.996 6.996 0 0 0 10 14a6.997 6.997 0 0 0 3.883-2.447 6.997 6.997 0 0 0-.768-8.015A8.037 8.037 0 0 0 10 3Z" />
      <path fillRule="evenodd" d="M9.25 16.5v.75a.75.75 0 0 0 1.5 0v-.75a8.521 8.521 0 0 0 4.984-1.927 8.497 8.497 0 0 0 .886-10.08.75.75 0 0 0-.054-.089 9.462 9.462 0 0 0-1.453-1.767A9.536 9.536 0 0 0 10 .5a9.537 9.537 0 0 0-5.113 2.387 9.464 9.464 0 0 0-1.453 1.767.754.754 0 0 0-.054.089 8.497 8.497 0 0 0 .886 10.08A8.521 8.521 0 0 0 9.25 16.75ZM10 2a7.966 7.966 0 0 0-4.28 1.242A7.967 7.967 0 0 0 3 10a7.967 7.967 0 0 0 2.72 6.758A7.966 7.966 0 0 0 10 18a7.966 7.966 0 0 0 4.28-1.242A7.967 7.967 0 0 0 17 10a7.967 7.967 0 0 0-2.72-6.758A7.966 7.966 0 0 0 10 2Z" clipRule="evenodd" />
    </svg>
  );
}

// Resource Icons
function HelpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function BlogIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v11.75A2.75 2.75 0 0 0 16.75 18h-12A2.75 2.75 0 0 1 2 15.25V3.5Zm3.75 7a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Zm0 3a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5ZM5 5.75A.75.75 0 0 1 5.75 5h4.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 8.25v-2.5Z" clipRule="evenodd" />
      <path d="M16.5 6.5h-1v8.75a1.25 1.25 0 1 0 2.5 0V8a1.5 1.5 0 0 0-1.5-1.5Z" />
    </svg>
  );
}

function ChangelogIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function RoadmapIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
    </svg>
  );
}
