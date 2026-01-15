"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Save,
  ExternalLink,
  Eye,
  Settings,
  FileText,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import type { MarketingPage } from "@prisma/client";
import { updateMarketingPage, publishMarketingPage } from "@/lib/actions/marketing-cms";

interface Props {
  page: MarketingPage;
}

// JSON editor with syntax highlighting
function JsonEditor({
  value,
  onChange,
  label,
  description,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  description?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    try {
      JSON.parse(newValue);
      setError(null);
    } catch (e) {
      setError("Invalid JSON");
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--foreground)]">{label}</label>
      {description && <p className="text-sm text-[var(--foreground-muted)]">{description}</p>}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={cn(
            "w-full min-h-[400px] p-4 rounded-lg font-mono text-sm",
            "bg-[var(--background)] border",
            error ? "border-red-500" : "border-[var(--border)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]",
            "resize-y"
          )}
          spellCheck={false}
        />
        {error && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

// Input field
function InputField({
  label,
  value,
  onChange,
  placeholder,
  description,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[var(--foreground)]">{label}</label>
        {maxLength && (
          <span className={cn("text-xs", value.length > maxLength ? "text-red-500" : "text-[var(--foreground-muted)]")}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {description && <p className="text-sm text-[var(--foreground-muted)]">{description}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-2.5 rounded-lg",
          "bg-[var(--background)] border border-[var(--border)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]",
          "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
        )}
      />
    </div>
  );
}

// Textarea field
function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  description,
  maxLength,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[var(--foreground)]">{label}</label>
        {maxLength && (
          <span className={cn("text-xs", value.length > maxLength ? "text-red-500" : "text-[var(--foreground-muted)]")}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {description && <p className="text-sm text-[var(--foreground-muted)]">{description}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "w-full px-4 py-2.5 rounded-lg resize-y",
          "bg-[var(--background)] border border-[var(--border)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]",
          "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
        )}
      />
    </div>
  );
}

// Select field
function SelectField({
  label,
  value,
  onChange,
  options,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--foreground)]">{label}</label>
      {description && <p className="text-sm text-[var(--foreground-muted)]">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-4 py-2.5 rounded-lg",
          "bg-[var(--background)] border border-[var(--border)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]",
          "text-[var(--foreground)]"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Tab button
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

export function PageEditorClient({ page }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Form state
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(JSON.stringify(page.content, null, 2));
  const [metaTitle, setMetaTitle] = useState(page.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(page.metaDescription || "");
  const [ogImage, setOgImage] = useState(page.ogImage || "");
  const [status, setStatus] = useState(page.status);

  // Get public URL
  const publicUrl = page.slug === "homepage" ? "/" : `/${page.slug}`;

  // Handle save
  const handleSave = () => {
    setSaveStatus("saving");

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      setSaveStatus("error");
      return;
    }

    startTransition(async () => {
      const result = await updateMarketingPage({
        slug: page.slug,
        title,
        content: parsedContent,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        ogImage: ogImage || undefined,
        status: status as "draft" | "published" | "archived",
      });

      if (result.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
        router.refresh();
      } else {
        setSaveStatus("error");
      }
    });
  };

  // Handle publish
  const handlePublish = () => {
    startTransition(async () => {
      const result = await publishMarketingPage(page.slug);
      if (result.success) {
        setStatus("published");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6" data-element="page-editor">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/marketing/pages"
            className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors"
            aria-label="Back to pages"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--foreground-muted)]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--foreground)]">{page.title}</h1>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  status === "published"
                    ? "bg-green-500/10 text-green-500"
                    : status === "draft"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-gray-500/10 text-gray-400"
                )}
              >
                {status}
              </span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">/{page.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
              "text-sm font-medium text-[var(--foreground-muted)]",
              "hover:bg-[var(--background-elevated)] transition-colors"
            )}
          >
            <Eye className="w-4 h-4" />
            Preview
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {status !== "published" && (
            <button
              onClick={handlePublish}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                "text-sm font-medium",
                "bg-green-600 text-white hover:bg-green-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors"
              )}
            >
              Publish
            </button>
          )}

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
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
        <TabButton
          active={activeTab === "content"}
          onClick={() => setActiveTab("content")}
          icon={FileText}
          label="Content"
        />
        <TabButton
          active={activeTab === "seo"}
          onClick={() => setActiveTab("seo")}
          icon={Eye}
          label="SEO"
        />
        <TabButton
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          icon={Settings}
          label="Settings"
        />
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        {activeTab === "content" && (
          <div className="space-y-6">
            <InputField
              label="Page Title"
              value={title}
              onChange={setTitle}
              placeholder="Enter page title"
              description="Internal title used in the CMS"
            />

            <JsonEditor
              label="Page Content (JSON)"
              value={content}
              onChange={setContent}
              description="Edit the page content structure. Changes are reflected on the live page after saving."
            />
          </div>
        )}

        {activeTab === "seo" && (
          <div className="space-y-6">
            <InputField
              label="Meta Title"
              value={metaTitle}
              onChange={setMetaTitle}
              placeholder="Page title for search engines"
              description="Appears in browser tabs and search results. Recommended: 50-60 characters."
              maxLength={60}
            />

            <TextareaField
              label="Meta Description"
              value={metaDescription}
              onChange={setMetaDescription}
              placeholder="Brief description for search engines"
              description="Appears in search results under the title. Recommended: 150-160 characters."
              maxLength={160}
            />

            <InputField
              label="Open Graph Image URL"
              value={ogImage}
              onChange={setOgImage}
              placeholder="https://example.com/image.jpg"
              description="Image shown when sharing on social media. Recommended: 1200x630px"
            />

            {/* SEO Preview */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-4">Search Result Preview</h3>
              <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer">
                  {metaTitle || title || "Page Title"}
                </p>
                <p className="text-[#006621] text-sm mt-1">
                  photoproos.com{publicUrl}
                </p>
                <p className="text-sm text-[var(--foreground-secondary)] mt-1 line-clamp-2">
                  {metaDescription || "Add a meta description to see a preview here..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <SelectField
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
              description="Draft pages are not visible on the public site"
            />

            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">Page Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex">
                  <dt className="text-[var(--foreground-muted)] w-32">Slug:</dt>
                  <dd className="text-[var(--foreground)]">{page.slug}</dd>
                </div>
                <div className="flex">
                  <dt className="text-[var(--foreground-muted)] w-32">Page Type:</dt>
                  <dd className="text-[var(--foreground)]">{page.pageType}</dd>
                </div>
                <div className="flex">
                  <dt className="text-[var(--foreground-muted)] w-32">Created:</dt>
                  <dd className="text-[var(--foreground)]">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="text-[var(--foreground-muted)] w-32">Last Updated:</dt>
                  <dd className="text-[var(--foreground)]">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
