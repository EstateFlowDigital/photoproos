"use client";

import { useState, useTransition } from "react";
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

// Tab button component
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-[var(--primary)] text-white"
          : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// Input field component
function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--foreground)]">{label}</label>
      <input
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

// Link editor component
function LinkEditor({
  link,
  onChange,
  onRemove,
}: {
  link: NavLink;
  onChange: (link: NavLink) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)] group">
      <div className="flex-shrink-0 cursor-grab text-[var(--foreground-muted)]">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-3">
        <InputField
          label="Label"
          value={link.label}
          onChange={(value) => onChange({ ...link, label: value })}
          placeholder="Link text"
        />
        <InputField
          label="URL"
          value={link.href}
          onChange={(value) => onChange({ ...link, href: value })}
          placeholder="/page-url"
        />
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 transition-all"
        aria-label="Remove link"
      >
        <X className="w-4 h-4" />
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

  // Navbar state
  const [navbarContent, setNavbarContent] = useState<string>(
    JSON.stringify(navbar?.content || { links: [], ctaText: "", ctaLink: "" }, null, 2)
  );

  // Footer state
  const [footerContent, setFooterContent] = useState<string>(
    JSON.stringify(footer?.content || { columns: [], legal: [], copyright: "" }, null, 2)
  );

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
  const handleSave = () => {
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
  };

  return (
    <div className="space-y-6" data-element="navigation-editor">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/marketing"
            className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors"
            aria-label="Back to Marketing CMS"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--foreground-muted)]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">Navigation</h1>
            <p className="text-sm text-[var(--foreground-muted)]">Edit navbar and footer links</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending || saveStatus === "saving"}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
            "text-sm font-medium",
            "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors min-w-[100px] justify-center"
          )}
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving
            </>
          ) : saveStatus === "saved" ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : saveStatus === "error" ? (
            <>
              <AlertCircle className="w-4 h-4" />
              Error
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save
            </>
          )}
        </button>
      </div>

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
              <div className="space-y-2">
                {(parsedNavbar.links || []).map((link, index) => (
                  <LinkEditor
                    key={index}
                    link={link}
                    onChange={(updated) => updateNavbarLink(index, updated)}
                    onRemove={() => removeNavbarLink(index)}
                  />
                ))}
              </div>
              <button
                onClick={addNavbarLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>

            {/* CTA settings */}
            <div className="border-t border-[var(--border)] pt-6 space-y-4">
              <h3 className="text-sm font-medium text-[var(--foreground)]">Call to Action</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="CTA Text"
                  value={parsedNavbar.ctaText || ""}
                  onChange={(value) => {
                    setNavbarContent(JSON.stringify({ ...parsedNavbar, ctaText: value }, null, 2));
                  }}
                  placeholder="Start Free Trial"
                />
                <InputField
                  label="CTA Link"
                  value={parsedNavbar.ctaLink || ""}
                  onChange={(value) => {
                    setNavbarContent(JSON.stringify({ ...parsedNavbar, ctaLink: value }, null, 2));
                  }}
                  placeholder="/sign-up"
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
