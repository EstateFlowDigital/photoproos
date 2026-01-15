"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PlatformId, PostFormat } from "@/components/marketing-studio/types";
import type { IndustryId } from "@/components/mockups/types";
import { PLATFORMS, PLATFORM_LIST } from "@/lib/marketing-studio/platforms";
import { getMockupById } from "@/components/mockups/mockup-registry";
import { getIndustriesArray } from "@/lib/constants/industries";
import { exportToPng, copyToClipboard } from "@/lib/mockups/export";
import { InstagramPreview } from "@/components/marketing-studio/previews/instagram-preview";
import { LinkedInPreview } from "@/components/marketing-studio/previews/linkedin-preview";
import { TwitterPreview } from "@/components/marketing-studio/previews/twitter-preview";
import { FacebookPreview } from "@/components/marketing-studio/previews/facebook-preview";
import { TikTokPreview } from "@/components/marketing-studio/previews/tiktok-preview";
import { PinterestPreview } from "@/components/marketing-studio/previews/pinterest-preview";
import { CaptionEditor } from "@/components/marketing-studio/composer/caption-editor";
import { MockupPicker } from "@/components/marketing-studio/composer/mockup-picker";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Copy,
  ImageIcon,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  ChevronDown,
  Layers,
  Settings2,
  X,
  Sun,
  Moon,
  Palette,
} from "lucide-react";

// Custom TikTok icon (not in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

// Custom Pinterest icon (simplified)
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.95s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.52.77 1.52 1.68 0 1.02-.65 2.55-.99 3.97-.28 1.19.6 2.16 1.78 2.16 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5-4.88-3.41 0-5.41 2.55-5.41 5.2 0 1.02.39 2.13.89 2.73a.35.35 0 0 1 .08.34l-.33 1.35c-.05.22-.18.27-.41.16-1.53-.72-2.49-2.96-2.49-4.77 0-3.88 2.82-7.45 8.14-7.45 4.28 0 7.6 3.05 7.6 7.12 0 4.25-2.68 7.67-6.4 7.67-1.25 0-2.42-.65-2.82-1.42l-.77 2.93c-.28 1.07-1.03 2.42-1.54 3.24A12 12 0 1 0 12 0z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
};

export function PostComposer() {
  const searchParams = useSearchParams();

  // State
  const [selectedPlatform, setSelectedPlatform] = React.useState<PlatformId>("instagram");
  const [selectedFormat, setSelectedFormat] = React.useState<PostFormat>("feed");
  const [selectedMockupId, setSelectedMockupId] = React.useState<string | undefined>();
  const [industry, setIndustry] = React.useState<IndustryId>("real_estate");
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [caption, setCaption] = React.useState("");
  const [isExporting, setIsExporting] = React.useState(false);
  const [showMockupPicker, setShowMockupPicker] = React.useState(true);

  // Preview engagement data (editable in future)
  const [engagement, setEngagement] = React.useState({
    likes: 1247,
    comments: 48,
    shares: 12,
    views: 8543,
    reactions: 892,
    reposts: 34,
  });

  // Refs
  const previewRef = React.useRef<HTMLDivElement>(null);

  // Derived data
  const industries = getIndustriesArray();
  const selectedMockup = selectedMockupId ? getMockupById(selectedMockupId) : undefined;
  const platformConfig = PLATFORMS[selectedPlatform];

  // Initialize from URL params
  React.useEffect(() => {
    const source = searchParams.get("source");
    const mockupId = searchParams.get("mockup");
    if (source === "mockup" && mockupId) {
      setSelectedMockupId(mockupId);
    }
  }, [searchParams]);

  // Handle mockup selection
  const handleMockupSelect = (mockupId: string) => {
    setSelectedMockupId(mockupId);
  };

  // Handle export
  const handleExport = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      const filename = `photoproos-${selectedPlatform}-${selectedFormat}-${Date.now()}`;
      await exportToPng(previewRef.current, filename, {
        scale: 2,
        backgroundColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
      });
      toast.success("Exported as PNG");
    } catch (error) {
      toast.error("Failed to export");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      await copyToClipboard(previewRef.current, {
        scale: 2,
        backgroundColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
      });
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  // Extract hashtags from caption
  const hashtags = React.useMemo(() => {
    const matches = caption.match(/#\w+/g) || [];
    return matches;
  }, [caption]);

  // Render platform preview
  const renderPreview = () => {
    // Render selected mockup if any
    const MockupComponent = selectedMockup?.component;
    const mockupData = selectedMockup?.getDefaultData(industry) || {};
    const mockupContent = MockupComponent ? (
      <MockupComponent
        data={mockupData}
        theme={theme}
        primaryColor={primaryColor}
        industry={industry}
      />
    ) : null;

    switch (selectedPlatform) {
      case "instagram":
        return (
          <InstagramPreview
            type={selectedFormat as "feed" | "story" | "reel" | "carousel"}
            caption={caption}
            username="photoproos"
            avatar={undefined}
            likes={engagement.likes}
            comments={engagement.comments}
            timestamp="2 hours ago"
            hashtags={hashtags}
            isVerified={true}
          >
            {mockupContent}
          </InstagramPreview>
        );

      case "linkedin":
        return (
          <LinkedInPreview
            type={selectedFormat as "post" | "article"}
            text={caption}
            authorName="PhotoProOS"
            authorTitle="The Business OS for Photographers"
            authorAvatar={undefined}
            reactions={engagement.reactions}
            comments={engagement.comments}
            reposts={engagement.reposts}
            connectionDegree="1st"
          >
            {mockupContent}
          </LinkedInPreview>
        );

      case "twitter":
        return (
          <TwitterPreview
            type="tweet"
            text={caption}
            authorName="PhotoProOS"
            authorHandle="photoproos"
            authorAvatar={undefined}
            likes={engagement.likes}
            retweets={engagement.reposts}
            replies={engagement.comments}
            views={engagement.views}
            timestamp="2h"
            isVerified={true}
          >
            {mockupContent}
          </TwitterPreview>
        );

      case "facebook":
        return (
          <FacebookPreview
            type={selectedFormat as "post" | "story"}
            text={caption}
            authorName="PhotoProOS"
            authorAvatar={undefined}
            reactions={engagement.reactions}
            comments={engagement.comments}
            shares={engagement.shares}
            timestamp="2h"
            privacy="public"
          >
            {mockupContent}
          </FacebookPreview>
        );

      case "tiktok":
        return (
          <TikTokPreview
            type="video"
            caption={caption}
            authorName="PhotoProOS"
            authorHandle="photoproos"
            authorAvatar={undefined}
            likes={engagement.likes}
            comments={engagement.comments}
            bookmarks={engagement.reactions}
            shares={engagement.shares}
            soundName="Original sound"
            isVerified={true}
          >
            {mockupContent}
          </TikTokPreview>
        );

      case "pinterest":
        return (
          <PinterestPreview
            type="pin"
            title={caption.split("\n")[0] || "Photography Inspiration"}
            description={caption}
            authorName="PhotoProOS"
            authorAvatar={undefined}
            boardName="Photography"
            saves={engagement.reactions}
            sourceUrl="photoproos.com"
          >
            {mockupContent}
          </PinterestPreview>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-[var(--foreground-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--foreground-muted)]">
                Preview coming soon for {platformConfig.name}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="post-composer flex flex-col h-[calc(100vh-64px)]">
      {/* Top Bar */}
      <div className="flex-shrink-0 border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Back and Title */}
          <div className="flex items-center gap-4">
            <Link
              href="/super-admin/marketing-studio"
              className="flex items-center gap-1 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            <div className="h-6 w-px bg-[var(--card-border)]" />
            <h1 className="text-lg font-semibold text-[var(--foreground)]">
              Post Composer
            </h1>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)] disabled:opacity-50"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export PNG
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Mockup Picker */}
        {showMockupPicker && (
          <div className="w-64 flex-shrink-0 border-r border-[var(--card-border)] bg-[var(--background-secondary)] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-[var(--card-border)]">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--foreground-muted)]" />
                <span className="text-sm font-medium text-[var(--foreground)]">Mockups</span>
              </div>
              <button
                onClick={() => setShowMockupPicker(false)}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <MockupPicker
              selectedMockupId={selectedMockupId}
              onSelect={handleMockupSelect}
              industry={industry}
              className="flex-1"
            />
          </div>
        )}

        {/* Center - Canvas/Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Platform Selector */}
          <div className="flex-shrink-0 border-b border-[var(--card-border)] bg-[var(--card)] p-4">
            <div className="flex items-center justify-between">
              {/* Platform tabs */}
              <div className="flex items-center gap-2">
                {PLATFORM_LIST.map((platform) => {
                  const Icon = PLATFORM_ICONS[platform.id] || ImageIcon;
                  const isSelected = selectedPlatform === platform.id;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        setSelectedFormat(platform.formats[0]);
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {platform.name}
                    </button>
                  );
                })}
              </div>

              {/* Format selector */}
              <div className="flex items-center gap-2">
                {platformConfig.formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                      selectedFormat === format
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
                    )}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 overflow-auto p-6 bg-[var(--background)]">
            <div className="flex justify-center">
              <div ref={previewRef} className="inline-block">
                {renderPreview()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Settings & Caption */}
        <div className="w-80 flex-shrink-0 border-l border-[var(--card-border)] bg-[var(--background-secondary)] flex flex-col overflow-hidden">
          {/* Settings */}
          <div className="flex-shrink-0 p-4 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="h-4 w-4 text-[var(--foreground-muted)]" />
              <span className="text-sm font-medium text-[var(--foreground)]">Settings</span>
            </div>

            <div className="space-y-3">
              {/* Industry selector */}
              <div>
                <label className="block text-xs text-[var(--foreground-muted)] mb-1.5">
                  Industry
                </label>
                <div className="relative">
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as IndustryId)}
                    className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 pr-8 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none cursor-pointer"
                  >
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {ind.shortName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" />
                </div>
              </div>

              {/* Theme and Color */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                >
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  {theme === "dark" ? "Dark" : "Light"}
                </button>
                <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                  <Palette className="h-4 w-4 text-[var(--foreground-muted)]" />
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-5 w-5 cursor-pointer appearance-none rounded border-0 bg-transparent"
                  />
                </div>
              </div>

              {/* Toggle mockup picker */}
              {!showMockupPicker && (
                <button
                  onClick={() => setShowMockupPicker(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
                >
                  <Layers className="h-4 w-4" />
                  Show Mockups
                </button>
              )}
            </div>
          </div>

          {/* Caption Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 p-4 pb-2">
              <span className="text-sm font-medium text-[var(--foreground)]">Caption</span>
            </div>
            <div className="flex-1 px-4 pb-4 overflow-auto">
              <CaptionEditor
                value={caption}
                onChange={setCaption}
                platform={selectedPlatform}
                industry={industry}
                placeholder={`Write your ${platformConfig.name} caption...`}
              />
            </div>
          </div>

          {/* Selected Mockup Info */}
          {selectedMockup && (
            <div className="flex-shrink-0 p-4 border-t border-[var(--card-border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-4 w-4 text-[var(--primary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {selectedMockup.name}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      Mockup selected
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMockupId(undefined)}
                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
