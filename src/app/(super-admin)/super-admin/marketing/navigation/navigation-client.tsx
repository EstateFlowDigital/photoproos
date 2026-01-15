"use client";

import { useState, useTransition, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Navigation,
  Menu,
  Sparkles,
  Plus,
  X,
  GripVertical,
} from "lucide-react";
import type { MarketingNavigation } from "@prisma/client";
import { updateNavigation } from "@/lib/actions/marketing-cms";

interface Props {
  navbar: MarketingNavigation | null;
  footer: MarketingNavigation | null;
}

interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

interface NavContent {
  links?: NavLink[];
  ctaText?: string;
  ctaLink?: string;
}

interface FooterContent {
  columns?: {
    title: string;
    links: NavLink[];
  }[];
  legal?: NavLink[];
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  copyright?: string;
}

// Tab button component with ARIA attributes
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  tabId,
  panelId,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  tabId?: string;
  panelId?: string;
}) {
  return (
    <button
      role="tab"
      id={tabId}
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
        active
          ? "bg-[var(--primary)] text-white"
          : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]"
      )}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      {label}
    </button>
  );
}

// Generate unique IDs for form fields
let navFieldIdCounter = 0;
function useNavFieldId(prefix: string) {
  const [id] = useState(() => `nav-${prefix}-${++navFieldIdCounter}`);
  return id;
}

// Input field component with proper accessibility
function InputField({
  label,
  value,
  onChange,
  placeholder,
  id: providedId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const generatedId = useNavFieldId("input");
  const inputId = providedId || generatedId;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full px-3 py-2 rounded-lg text-sm",
          "bg-[var(--background)] border border-[var(--border)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--background)]",
          "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
        )}
      />
    </div>
  );
}

// Link editor component with accessibility
function LinkEditor({
  link,
  onChange,
  onRemove,
  index,
}: {
  link: NavLink;
  onChange: (link: NavLink) => void;
  onRemove: () => void;
  index: number;
}) {
  return (
    <div
      className="flex items-start gap-3 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)] group"
      role="listitem"
    >
      <div
        className="flex-shrink-0 cursor-grab text-[var(--foreground-muted)] mt-7"
        aria-hidden="true"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label="Label"
          value={link.label}
          onChange={(value) => onChange({ ...link, label: value })}
          placeholder="Link text"
          id={`nav-link-${index}-label`}
        />
        <InputField
          label="URL"
          value={link.href}
          onChange={(value) => onChange({ ...link, href: value })}
          placeholder="/page-url"
          id={`nav-link-${index}-href`}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "flex-shrink-0 p-1.5 rounded-lg mt-7",
          "sm:opacity-0 sm:group-hover:opacity-100",
          "hover:bg-red-500/10 text-red-500",
          "transition-all",
          "focus:outline-none focus:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500"
        )}
        aria-label={`Remove ${link.label || "link"}`}
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// JSON editor for advanced editing
function JsonEditor({
  value,
  onChange,
  onFormat,
}: {
  value: string;
  onChange: (value: string) => void;
  onFormat: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    try {
      JSON.parse(newValue);
      setError(null);
    } catch {
      setError("Invalid JSON syntax");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[var(--foreground)]">Raw JSON</label>
        <button
          onClick={onFormat}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Format JSON
        </button>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={cn(
            "w-full min-h-[400px] p-4 rounded-lg font-mono text-sm leading-relaxed",
            "bg-[var(--background)] border",
            error ? "border-red-500" : "border-[var(--border)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--background)]",
            "resize-y"
          )}
          spellCheck={false}
        />
        {error && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-xs text-red-500">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export function NavigationEditorClient({ navbar, footer }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"navbar" | "footer">("navbar");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Original content for tracking changes
  const originalNavbar = useMemo(
    () => JSON.stringify(navbar?.content || { links: [], ctaText: "", ctaLink: "" }, null, 2),
    [navbar]
  );
  const originalFooter = useMemo(
    () => JSON.stringify(footer?.content || { columns: [], legal: [], copyright: "" }, null, 2),
    [footer]
  );

  // Navbar state
  const [navbarContent, setNavbarContent] = useState<string>(originalNavbar);

  // Footer state
  const [footerContent, setFooterContent] = useState<string>(originalFooter);

  // Track unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return navbarContent !== originalNavbar || footerContent !== originalFooter;
  }, [navbarContent, footerContent, originalNavbar, originalFooter]);

  // Parse content for visual editing
  const parsedNavbar: NavContent = (() => {
    try {
      return JSON.parse(navbarContent);
    } catch {
      return { links: [] };
    }
  })();

  const parsedFooter: FooterContent = (() => {
    try {
      return JSON.parse(footerContent);
    } catch {
      return { columns: [] };
    }
  })();

  // Handle navbar link changes
  const updateNavbarLinks = (links: NavLink[]) => {
    setNavbarContent(JSON.stringify({ ...parsedNavbar, links }, null, 2));
  };

  const addNavbarLink = () => {
    const links = [...(parsedNavbar.links || []), { label: "", href: "" }];
    updateNavbarLinks(links);
  };

  const removeNavbarLink = (index: number) => {
    const links = [...(parsedNavbar.links || [])];
    links.splice(index, 1);
    updateNavbarLinks(links);
  };

  const updateNavbarLink = (index: number, link: NavLink) => {
    const links = [...(parsedNavbar.links || [])];
    links[index] = link;
    updateNavbarLinks(links);
  };

  // Format JSON
  const formatNavbarJson = () => {
    try {
      const parsed = JSON.parse(navbarContent);
      setNavbarContent(JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON
    }
  };

  const formatFooterJson = () => {
    try {
      const parsed = JSON.parse(footerContent);
      setFooterContent(JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON
    }
  };

  // Handle save
  const handleSave = useCallback(() => {
    setSaveStatus("saving");

    let parsedNav, parsedFoot;
    try {
      parsedNav = JSON.parse(navbarContent);
      parsedFoot = JSON.parse(footerContent);
    } catch {
      setSaveStatus("error");
      return;
    }

    startTransition(async () => {
      const [navResult, footResult] = await Promise.all([
        updateNavigation({ location: "navbar", content: parsedNav }),
        updateNavigation({ location: "footer", content: parsedFoot }),
      ]);

      if (navResult.success && footResult.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
        router.refresh();
      } else {
        setSaveStatus("error");
      }
    });
  }, [navbarContent, footerContent, router]);

  // Keyboard shortcut for save (Cmd/Ctrl + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (!isPending && saveStatus !== "saving") {
          handleSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, isPending, saveStatus]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="space-y-6" data-element="navigation-editor">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/marketing"
            className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            aria-label="Back to Marketing CMS"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--foreground-muted)]" aria-hidden="true" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[var(--foreground)]">Navigation</h1>
              {hasUnsavedChanges && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-medium">
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">Edit navbar and footer links</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || saveStatus === "saving"}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
            "text-sm font-medium",
            "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors min-w-[100px] justify-center",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)]"
          )}
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Saving
            </>
          ) : saveStatus === "saved" ? (
            <>
              <Check className="w-4 h-4" aria-hidden="true" />
              Saved
            </>
          ) : saveStatus === "error" ? (
            <>
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              Error
            </>
          ) : (
            <>
              <Save className="w-4 h-4" aria-hidden="true" />
              Save
            </>
          )}
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      <p className="text-xs text-[var(--foreground-muted)]">
        Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-elevated)] font-mono">⌘S</kbd> to save
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
        <TabButton
          active={activeTab === "navbar"}
          onClick={() => setActiveTab("navbar")}
          icon={Navigation}
          label="Navbar"
        />
        <TabButton
          active={activeTab === "footer"}
          onClick={() => setActiveTab("footer")}
          icon={Menu}
          label="Footer"
        />
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        {activeTab === "navbar" && (
          <div className="space-y-6">
            {/* Visual link editor */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[var(--foreground)]">Navigation Links</h3>
              <div className="space-y-2" role="list" aria-label="Navigation links">
                {(parsedNavbar.links || []).map((link, index) => (
                  <LinkEditor
                    key={index}
                    link={link}
                    index={index}
                    onChange={(updated) => updateNavbarLink(index, updated)}
                    onRemove={() => removeNavbarLink(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={addNavbarLink}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                  "border-2 border-dashed border-[var(--border)]",
                  "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)]",
                  "transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                )}
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add Link
              </button>
            </div>

            {/* CTA settings */}
            <div className="border-t border-[var(--border)] pt-6 space-y-4">
              <h3 className="text-sm font-medium text-[var(--foreground)]">Call to Action</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="CTA Text"
                  value={parsedNavbar.ctaText || ""}
                  onChange={(value) => {
                    setNavbarContent(JSON.stringify({ ...parsedNavbar, ctaText: value }, null, 2));
                  }}
                  placeholder="Start Free Trial"
                  id="navbar-cta-text"
                />
                <InputField
                  label="CTA Link"
                  value={parsedNavbar.ctaLink || ""}
                  onChange={(value) => {
                    setNavbarContent(JSON.stringify({ ...parsedNavbar, ctaLink: value }, null, 2));
                  }}
                  placeholder="/sign-up"
                  id="navbar-cta-link"
                />
              </div>
            </div>

            {/* JSON editor */}
            <div className="border-t border-[var(--border)] pt-6">
              <JsonEditor
                value={navbarContent}
                onChange={setNavbarContent}
                onFormat={formatNavbarJson}
              />
            </div>
          </div>
        )}

        {activeTab === "footer" && (
          <div className="space-y-6">
            <p className="text-sm text-[var(--foreground-muted)]">
              Edit the footer content structure below. The footer supports columns with links, legal links, and social media links.
            </p>

            {/* JSON editor for footer */}
            <JsonEditor
              value={footerContent}
              onChange={setFooterContent}
              onFormat={formatFooterJson}
            />

            {/* Preview of footer structure */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-4">Footer Structure</h3>
              <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                <pre className="text-xs text-[var(--foreground-muted)] overflow-auto">
{`{
  "columns": [
    {
      "title": "Product",
      "links": [
        { "label": "Features", "href": "/features" },
        { "label": "Pricing", "href": "/pricing" }
      ]
    }
  ],
  "legal": [
    { "label": "Privacy", "href": "/legal/privacy" }
  ],
  "socialLinks": [
    { "platform": "twitter", "url": "https://twitter.com/..." }
  ],
  "copyright": "© 2025 PhotoProOS. All rights reserved."
}`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
